import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from gensim.models import Word2Vec
from gensim.utils import simple_preprocess
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import hstack
import joblib

# Load the data
df = pd.read_csv('train.csv', dtype=str)

# Strip any leading/trailing spaces from column names
df.columns = df.columns.str.strip()

# Check if 'degerlendirme puani' column exists
if 'degerlendirme puani' not in df.columns:
    raise KeyError("Column 'degerlendirme puani' not found in the DataFrame.")

# Handle missing values
df = df.dropna(subset=['degerlendirme puani'])
df = df.dropna(subset=['dogum yeri', 'ikametgah sehri', 'universite adi', 'universite turu'])

# Preprocess categorical features
categorical_features = ['dogum yeri', 'ikametgah sehri', 'universite adi', 'universite turu']
text_columns = [
    'girisimcilikle ilgili deneyiminiz var mi?',
    'girisimcilikle ilgili deneyiminizi aciklayabilir misiniz?'
]

# Fill missing values in text columns
df[text_columns] = df[text_columns].fillna('')

# Combine text columns into one for processing
df['combined_text'] = df[text_columns].apply(lambda x: ' '.join(x), axis=1)

# Tokenize and preprocess the text data for Word2Vec
def preprocess_text(text):
    return simple_preprocess(text, deacc=True)

# Prepare the Word2Vec model
sentences = [preprocess_text(text) for text in df['combined_text']]
word2vec_model = Word2Vec(sentences, vector_size=100, window=5, min_count=1, workers=4)

# Create document vectors by averaging word vectors
def vectorize_text(text):
    tokens = preprocess_text(text)
    vectors = [word2vec_model.wv[token] for token in tokens if token in word2vec_model.wv]
    if len(vectors) == 0:
        return np.zeros(word2vec_model.vector_size)
    return np.mean(vectors, axis=0)

df['text_vector'] = df['combined_text'].apply(vectorize_text)
word2vec_features = np.array(df['text_vector'].tolist())

# TF-IDF Vectorization
text_data = df['combined_text']
tfidf_vectorizer = TfidfVectorizer(max_features=1000)
tfidf_vectors = tfidf_vectorizer.fit_transform(text_data)

# Combine Word2Vec and TF-IDF features
combined_text_features = hstack([tfidf_vectors, word2vec_features])

# Prepare features and target
X_cat = df[categorical_features]
y = df['degerlendirme puani']

# Create a ColumnTransformer for encoding categorical features
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ],
    remainder='passthrough'
)

# Encode categorical features
X_cat_encoded = preprocessor.fit_transform(X_cat)

# Combine encoded categorical features with text features
X_combined = hstack([X_cat_encoded, combined_text_features])

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_combined, y, test_size=0.2, random_state=42)

# Standardize the features
scaler = StandardScaler(with_mean=False)
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Train the regression model
model = LinearRegression()
model.fit(X_train, y_train)

# Predict on the test set
y_pred = model.predict(X_test)

# Evaluate the model
mse = mean_squared_error(y_test, y_pred)
print(f'Mean Squared Error: {mse:.2f}')

# Print actual vs predicted values
print("\nSample Actual vs. Predicted Values:")
for actual, predicted in zip(y_test.head(10), y_pred[:10]):
    print(f"Actual: {actual}, Predicted: {predicted}")

# Optionally, save the model and scaler for future use
joblib.dump(model, 'combined_regression_model.pkl')
joblib.dump(scaler, 'combined_scaler.pkl')
joblib.dump(tfidf_vectorizer, 'tfidf_vectorizer.pkl')
joblib.dump(word2vec_model, 'word2vec_model.pkl')
joblib.dump(preprocessor, 'preprocessor.pkl')
