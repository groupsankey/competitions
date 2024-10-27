import pandas as pd

# Load the dataset
df = pd.read_csv('train.csv', low_memory=False)

# 1. Standardize Column Names
df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')

# 2. Handle Missing Values
# Fill missing values for specific columns or drop rows/columns with too many missing values
df.fillna({
    'ingilizce_biliyor_musunuz?': 0,
    'ingilizce_seviyeniz?': '-',
    'baba_egitim_durumu': '-',
    'baba_calism_durumu': '-',
    'baba_sektor': '-',
    'kardes_sayisi': 0,
    'stknin_uyesisiniz': '-',
    "hangi_stk'nin_uyesisiniz?": '-',
    'stk_projesine_katildiniz_mi?': 0,
    'girisimcilikle_ilgili_deneyiminizi_aciklayabilir_misiniz?': '-',
    'daha_onceden_mezun_olunduysa,_mezun_olunan_universite': '-',
    'burs_aldigi_baska_kurum': '-',
    'anne_sektor': '-',
    'girisimcilikle_ilgili_deneyiminiz_var_mi?': '-',
    'aktif_olarak_bir_stk_uyesi_misiniz?': 0,
    'spor_dalindaki_rolunuz_nedir?':'diger',
    'uye_oldugunuz_kulubun_ismi': '-',
    'baba_calisma_durumu': 3,
    'anne_calisma_durumu':3,
    'lise_bolum_diger':'-',
    'lise_adi_diger':'-',
    'daha_once_baska_bir_universiteden_mezun_olmus': 0, 
    'baska_kurumdan_aldigi_burs_miktari': 0
    
}, inplace=True)

# For simplicity, drop rows where critical columns have missing values
df.dropna(subset=['universite_adi', 'bolum'], inplace=True)

# 3. Correct Data Types
df['dogum_tarihi'] = pd.to_datetime(df['dogum_tarihi'], errors='coerce')
df['universite_not_ortalamasi'] = pd.to_numeric(df['universite_not_ortalamasi'].str.extract('(\d+\.\d+)')[0], errors='coerce')

# Convert categorical columns to categories
categorical_cols = ['cinsiyet', 'universite_turu', 'burslu_ise_burs_yuzdesi', 'burs_aliyor_mu?', 'lise_turu', 'lise_bolumu', 'baska_bir_kurumdan_burs_aliyor_mu?']
for col in categorical_cols:
    df[col] = df[col].astype('category')

# 4. Clean Data Entries
# For example, remove leading/trailing whitespace in string columns
df['universite_adi'] = df['universite_adi'].str.strip()

# 5. Normalize Data
# Ensure consistent date formats and other standardizations
df['dogum_tarihi'] = df['dogum_tarihi'].dt.strftime('%Y-%m-%d')

# Define a function to map 'Evet' to 1 and 'Hayır' to 0
def map_evet_hayir(value):
    if value == 'evet':
        return 1
    elif value == 'hayir':
        return 0
    elif value == 'emekli':
        return 2;   
    else:
        return value

# Apply the function to the entire DataFrame
df = df.applymap(map_evet_hayir)
df['burslu_ise_burs_yuzdesi']=df['burslu_ise_burs_yuzdesi'].fillna(0)
df.drop(['cinsiyet'],axis=1)
df=df.dropna()
df['universite_not_ortalamasi']=df['universite_not_ortalamasi'].fillna(df['universite_not_ortalamasi'].mean)
df['lise_mezuniyet_notu']=df['lise_mezuniyet_notu'].fillna(df['lise_mezuniyet_notu'].mean)
df.to_csv('cleaned_Dataset.csv', index=False)