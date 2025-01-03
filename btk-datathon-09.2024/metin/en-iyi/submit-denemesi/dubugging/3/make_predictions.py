import pandas as pd
import numpy as np
from gensim.models import Word2Vec
from gensim.utils import simple_preprocess
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import hstack
from catboost import CatBoostRegressor
import joblib

# Load the test data
test_df = pd.read_csv('TestDataEnSON.csv')

# Load saved models and preprocessors
word2vec_model = Word2Vec.load('word2vec_model.model')
tfidf_vectorizer = joblib.load('tfidf_vectorizer.joblib')
preprocessor = joblib.load('preprocessor.joblib')
selector = joblib.load('feature_selector.joblib')

# Define necessary functions and variables
def preprocess_text(text):
    return simple_preprocess(str(text), deacc=True)

def vectorize_text(text, model):
    tokens = preprocess_text(text)
    vectors = [model.wv[token] for token in tokens if token in model.wv]
    if len(vectors) == 0:
        return np.zeros(model.vector_size)
    return np.mean(vectors, axis=0)

# Extract relevant columns for the classification model
cat_features = [
    'cinsiyet', 'dogum_yeri', 'ikametgah_sehri', 'universite_adi', 'universite_turu',
    'burs_aliyor_mu?', 'universite_kacinci_sinif', 'universite_not_ortalamasi',
    'lise_mezuniyet_notu', 'baska_bir_kurumdan_burs_aliyor_mu?', 'baska_kurumdan_aldigi_burs_miktari', 
    'anne_calisma_durumu', 'baba_calisma_durumu', 'kardes_sayisi',
    'girisimcilik_kulupleri_tarzi_bir_kulube_uye_misiniz?', 'profesyonel_bir_spor_daliyla_mesgul_musunuz?',
    'aktif_olarak_bir_stk_uyesi_misiniz?', 'girisimcilikle_ilgili_deneyiminiz_var_mi?', 'ingilizce_biliyor_musunuz?',
    'anne_sektor_encoded', 'baba_sektor_encoded', 'anne_unknown', 'anne_diger', 'anne_kamu',
    'anne_ozel_sektor', 'baba_unknown', 'baba_diger', 'baba_kamu', 'baba_ozel_sektor', 'age'
]

text_columns = ['girisimcilikle_ilgili_deneyiminizi_aciklayabilir_misiniz?', "bolum", "lise_adi", 'lise_sehir', 'lise_turu', 'lise_bolumu',
                'burs_aldigi_baska_kurum', 'anne_egitim_durumu', 'baba_egitim_durumu', 'spor_dalindaki_rolunuz_nedir?', "hangi_stk_nin_uyesisiniz?"]


# Preprocess test data
test_df[text_columns] = test_df[text_columns].fillna('')
test_df['combined_text'] = test_df[text_columns].apply(lambda x: ' '.join(map(str, x)), axis=1)

# Create document vectors for test data
test_df['text_vector'] = test_df['combined_text'].apply(lambda x: vectorize_text(x, word2vec_model))
test_word2vec_features = np.array(test_df['text_vector'].tolist())

# TF-IDF Vectorization for test data
test_tfidf_vectors = tfidf_vectorizer.transform(test_df['combined_text'])

# Combine Word2Vec and TF-IDF features for test data
test_combined_features = hstack([test_tfidf_vectors, test_word2vec_features])

# Prepare test data for the model
X_test_cat = test_df[cat_features].copy()

# Convert all columns to string type
for col in X_test_cat.columns:
    X_test_cat[col] = X_test_cat[col].astype(str)

# Preprocess test data
X_test_cat_preprocessed = preprocessor.transform(X_test_cat)

# Combine features for test data
X_test_combined = hstack([X_test_cat_preprocessed, test_combined_features])

# Apply feature selection
X_test_selected = selector.transform(X_test_combined)

# Load the saved ensemble model
ensemble_model = joblib.load('ensemble_model.joblib')

# Make predictions
test_predictions = ensemble_model.predict(X_test_selected)

# Create submission DataFrame
submission = pd.DataFrame({
    'id': test_df['id'],
    'Degerlendirme Puani': test_predictions
})

# Save the submission file
submission.to_csv('submission.csv', index=False)

print("Predictions have been saved to 'submission.csv'")