"""AssureX synthetic claims + matching cards. Open in Spyder and press Run."""
from pathlib import Path
from datetime import date, timedelta
from calendar import monthrange
import os
import random
import shutil
import pandas as pd
from sklearn.model_selection import train_test_split
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'output'
R = random.Random(42)
TODAY = date(2026, 9, 23)  # Fixed reference day so everyone reproduces the same set.
CLASSES = ['Valid Claim', 'Invalid Claim', 'Manual Review']
FAULTS = {
    'Phone': ['Display fault', 'Battery fault', 'Power fault'],
    'Laptop': ['Display fault', 'Battery fault', 'Power fault'],
    'Appliance': ['Power fault', 'Mechanical fault', 'Motor fault'],
}
SCENARIOS = {
    'Valid Claim': ['covered_fault', 'covered_fault', 'authorized_repair'],
    'Invalid Claim': ['expired', 'excluded_damage', 'unauthorized_repair'],
    'Manual Review': ['missing_proof', 'serial_mismatch', 'duplicate',
                      'fault_after_claim', 'repair_before_purchase'],
}


def add_months(day, months):
    """Calendar months, rather than approximating every month as 30.44 days."""
    year, month = divmod(day.year * 12 + day.month - 1 + months, 12)
    return date(year, month + 1, min(day.day, monthrange(year, month + 1)[1]))


def derive(row):
    """Calculate checkable facts from dates and evidence; never invent flag values."""
    purchase, claim = date.fromisoformat(row['purchase_date']), date.fromisoformat(row['claim_date'])
    fault = date.fromisoformat(row['fault_date'])
    repair_raw = row.get('repair_date')
    repair = date.fromisoformat(repair_raw) if isinstance(repair_raw, str) and repair_raw else None
    expiry = add_months(purchase, row['warranty_months'])
    row['warranty_expiry_date'] = expiry.isoformat()
    row['product_age_days'] = (claim - purchase).days
    row['remaining_warranty_days'] = (expiry - claim).days
    row['fault_claim_gap_days'] = (claim - fault).days
    row['repair_purchase_gap_days'] = (repair - purchase).days if repair else None
    row['serial_match'] = int(row['registered_serial'] == row['evidence_serial'])
    row['duplicate_indicator'] = int(bool(row['prior_claim_invoice']) and
                                     row['prior_claim_invoice'] == row['invoice_number'])
    row['contradiction_indicator'] = int(
        fault < purchase or fault > claim or (repair is not None and
        (repair < purchase or repair > claim)))
    return row


def classify(row):
    """Illustrative policy: clear exclusions, then unresolved evidence, then valid."""
    if (row['remaining_warranty_days'] < 0 or row['damage_type'] != 'None' or
            (row['repair_count'] > 0 and row['authorized_repair'] == 0)):
        return 'Invalid Claim'
    if (not row['receipt_present'] or row['missing_document_count'] > 0 or
            not row['serial_match'] or row['duplicate_indicator'] or
            row['contradiction_indicator']):
        return 'Manual Review'
    return 'Valid Claim'


def make_claim(label):
    category = R.choice(list(FAULTS))
    months = R.choice([12, 24, 36])
    scenario = R.choice(SCENARIOS[label])
    age_months = R.randint(2, months - 2)
    if scenario == 'expired':
        age_months = months + R.randint(2, 18)
    purchase = TODAY - timedelta(days=round(age_months * 30.44) + R.randint(0, 12))
    fault = TODAY - timedelta(days=R.randint(1, 16))
    if fault <= purchase:
        fault = purchase + timedelta(days=1)
    serial = 'SN' + ''.join(R.choices('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', k=8))
    invoice = 'INV' + ''.join(R.choices('0123456789', k=9))
    repairs = 1 if scenario in ('authorized_repair', 'unauthorized_repair',
                                'repair_before_purchase') else R.choice([0, 0, 1])
    repair_date = (purchase + timedelta(days=R.randint(1, max(2, (fault - purchase).days - 1)))
                   if repairs else None)
    row = dict(
        product_category=category, fault_type=R.choice(FAULTS[category]),
        purchase_date=purchase.isoformat(), claim_date=TODAY.isoformat(),
        fault_date=fault.isoformat(), repair_date=repair_date.isoformat() if repair_date else '',
        warranty_months=months, damage_type='None', receipt_present=1,
        registered_serial=serial, evidence_serial=serial, invoice_number=invoice,
        prior_claim_invoice='', prior_claim_id='', repair_count=repairs,
        authorized_repair=1 if repairs else None, missing_document_count=0,
        scenario_reason=scenario,
    )
    if scenario == 'excluded_damage':
        row['damage_type'] = R.choice(['Impact', 'Liquid'])
    elif scenario == 'unauthorized_repair':
        row['authorized_repair'] = 0
    elif scenario == 'missing_proof':
        row['receipt_present'] = 0
        row['invoice_number'] = ''
        row['missing_document_count'] = R.randint(1, 2)
    elif scenario == 'serial_mismatch':
        row['evidence_serial'] = serial[:-1] + ('X' if serial[-1] != 'X' else 'Y')
    elif scenario == 'duplicate':
        row['prior_claim_invoice'] = invoice
        row['prior_claim_id'] = 'PRIOR-' + invoice
    elif scenario == 'fault_after_claim':
        row['fault_date'] = (TODAY + timedelta(days=R.randint(1, 20))).isoformat()
    elif scenario == 'repair_before_purchase':
        row['repair_date'] = (purchase - timedelta(days=R.randint(1, 45))).isoformat()
    derive(row)
    assert classify(row) == label, (scenario, row)
    row['claim_class'] = label
    return row


def get_fonts():
    windows = Path(os.environ.get('WINDIR', r'C:\Windows')) / 'Fonts'
    pairs = [
        (windows / 'arial.ttf', windows / 'arialbd.ttf'),
        (Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'),
         Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
    ]
    pair = next(((a, b) for a, b in pairs if a.exists() and b.exists()), None)
    if pair:
        return (ImageFont.truetype(str(pair[0]), 17),
                ImageFont.truetype(str(pair[1]), 21),
                ImageFont.truetype(str(pair[1]), 25))
    return (ImageFont.load_default(size=17), ImageFont.load_default(size=21),
            ImageFont.load_default(size=25))


def draw_card(row, destination, variation):
    """Same neutral design for every class; show facts and source dates, never the answer."""
    ink, muted, edge, accent = '#172b3d', '#617483', '#dbe4e8', '#286e79'
    im = Image.new('RGB', (720, 580), '#ffffff' if variation == 0 else '#f8fafb')
    d = ImageDraw.Draw(im)
    font, bold, title = get_fonts()
    d.rounded_rectangle((13, 13, 707, 567), radius=18, outline=edge, width=2)
    d.rounded_rectangle((13, 13, 707, 90), radius=18, fill='#f0f6f7')
    d.rectangle((13, 70, 707, 90), fill='#f0f6f7')
    d.text((29, 23), 'ASSUREX', font=title, fill=ink)
    d.text((29, 57), 'CLAIM FACT SUMMARY', font=font, fill=accent)
    d.text((440, 24), row.product_category, font=font, fill=ink)
    d.text((440, 56), row.fault_type, font=font, fill=muted)
    d.text((29, 100), f'Age: {row.product_age_days} days   Coverage: {row.warranty_months} months',
           font=font, fill=muted)
    tiles = [
        ('Warranty', 'Expired' if row.remaining_warranty_days < 0 else 'Active'),
        ('Receipt', 'Present' if row.receipt_present else 'Missing'),
        ('Serial', 'Match' if row.serial_match else 'Mismatch'),
        ('Damage', row.damage_type),
        ('Repair history', 'No repairs' if row.repair_count == 0 else
         f'{row.repair_count}, ' + ('authorized' if row.authorized_repair else 'unauthorized')),
        ('Documents', 'Complete' if row.missing_document_count == 0 else
         f'Missing {row.missing_document_count}'),
        ('Duplicate', 'Possible' if row.duplicate_indicator else 'None'),
        ('Date check', 'Conflict' if row.contradiction_indicator else 'Consistent'),
    ]
    for i, (label, value) in enumerate(tiles):
        x, y = 28 + (i % 2) * 343, 139 + (i // 2) * 80
        d.rounded_rectangle((x, y, x + 323, y + 68), radius=9,
                            fill='#f5f7f8', outline=edge, width=1)
        d.text((x + 13, y + 8), label, font=font, fill=muted)
        d.text((x + 13, y + 33), value, font=bold, fill=ink)
    d.line((30, 469, 687, 469), fill=edge, width=2)
    d.text((30, 480), f"Purchased: {row.purchase_date}    Claimed: {row.claim_date}",
           font=font, fill=muted)
    repair_display = row.repair_date if isinstance(row.repair_date, str) and row.repair_date else 'None'
    d.text((30, 508), f"Fault: {row.fault_date}    Repair: {repair_display}",
           font=font, fill=muted)
    d.text((30, 536), f"Expiry: {row.warranty_expiry_date}", font=font, fill=muted)
    im.save(destination)


def validate(df, parts):
    assert len(df) == 1500 and df.claim_id.is_unique
    assert df.claim_class.value_counts().to_dict() == {c: 500 for c in CLASSES}
    ids = [set(part.claim_id) for part in parts]
    assert not (ids[0] & ids[1] or ids[0] & ids[2] or ids[1] & ids[2])
    assert [len(part) for part in parts] == [1050, 225, 225]
    for row in df.to_dict('records'):
        old_flags = (row['warranty_expiry_date'], row['serial_match'],
                     row['duplicate_indicator'], row['contradiction_indicator'])
        derive(row)
        assert old_flags == (row['warranty_expiry_date'], row['serial_match'],
                             row['duplicate_indicator'], row['contradiction_indicator'])
        assert classify(row) == row['claim_class']
    print('Validated: dates, evidence flags, labels, balances, unique IDs and split isolation.')


def main():
    rows = [make_claim(label) for label in CLASSES for _ in range(500)]
    R.shuffle(rows)
    for i, row in enumerate(rows, 1):
        row['claim_id'] = f'AX-{i:05d}'
    df = pd.DataFrame(rows)
    train, rest = train_test_split(df, test_size=.30, stratify=df.claim_class, random_state=42)
    validation, test = train_test_split(rest, test_size=.50,
                                        stratify=rest.claim_class, random_state=42)
    validate(df, [train, validation, test])
    OUT.mkdir(exist_ok=True)
    # Avoid keeping stale cards from a previous generator under the same IDs.
    if (OUT / 'cards').exists():
        shutil.rmtree(OUT / 'cards')
    df.to_csv(OUT / 'all_claims.csv', index=False)
    prior = df[df.duplicate_indicator == 1][['prior_claim_id', 'prior_claim_invoice']]
    prior.drop_duplicates().to_csv(OUT / 'prior_claims.csv', index=False)
    for name, split in [('train', train), ('validation', validation), ('test', test)]:
        split.to_csv(OUT / f'{name}.csv', index=False)
        for label in CLASSES:
            (OUT / 'cards' / name / label).mkdir(parents=True, exist_ok=True)
        for row in split.itertuples(index=False):
            variants = 2 if name == 'train' else 1
            for v in range(variants):
                path = OUT / 'cards' / name / row.claim_class / f'{row.claim_id}_v{v+1}.png'
                draw_card(row, path, v)
        print(name, 'claims:', len(split), 'images:', len(split)*variants)
    print('Finished. Look inside:', OUT)


if __name__ == '__main__':
    main()
