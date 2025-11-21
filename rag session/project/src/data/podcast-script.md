Here is your content rewritten cleanly and delivered as a **properly formatted Markdown file**:

---

# **Disney+ Hotstar – Recommender System Documentation**

## **1. Type of Recommender System**

Disney+ Hotstar uses a **Hybrid Recommender System**, combining:

* **Content-Based Filtering (CBF)**
* **Collaborative Filtering (CF)**
* **Contextual & Demographic Personalization**

### **1. Content-Based Filtering**

Recommends shows/movies similar to what the user has already watched.

Uses metadata such as:

* Genre
* Actors
* Language
* Director
* Keywords

**Example:**
If a user watches many Marvel movies, the system recommends similar action/fantasy content.

---

### **2. Collaborative Filtering**

Uses preferences of similar users to generate suggestions.

Two approaches:

* **User-Based CF:** Finds users with similar viewing patterns.
* **Item-Based CF:** Finds items similar to what users liked.

**Benefits:**

* Works even when metadata is limited.
* Captures hidden relationships between items & users.

---

### **3. Contextual & Demographic Personalization**

Recommendations are adjusted based on:

* Time of day
* Device type
* Region/language
* Trending events (e.g., IPL season)

**Example:**
Recommending cricket highlights during evenings in IPL season.

---

### **4. Hybrid Integration**

Hotstar combines all models using:

* **Weighted hybridization**
* **Ensemble learning**
* **Rank aggregation (ML-based)**

Final recommendations come from combining scores of multiple models.

---

## **2. Machine Learning Algorithms and Models Used**

### **A. Collaborative Filtering Algorithms**

#### **1. Matrix Factorization (MF)**

Decomposes user–item matrix into latent factors.

Techniques used:

* **Singular Value Decomposition (SVD)**
* **Alternating Least Squares (ALS)**

Captures hidden patterns in viewing behavior.

#### **2. Neighborhood-Based Filtering**

Uses similarity measures:

* Cosine similarity
* Pearson correlation

Types:

* **User-based**
* **Item-based**

Recommendations are based on similar users/items.

---

### **B. Content-Based Filtering Algorithms**

#### **1. TF-IDF + Cosine Similarity**

Used to vectorize:

* Genre
* Keywords
* Descriptions

Cosine similarity finds closest matching content.

#### **2. Word2Vec / Embedding Models**

Advanced semantic features using:

* **Word2Vec**
* **Doc2Vec**
* **BERT embeddings**

These models capture deeper contextual similarity.

---

### **C. Hybrid & Advanced ML Models**

#### **1. Deep Learning-Based Recommenders**

Used to model complex interactions between users & items.

Techniques include:

* **Neural Collaborative Filtering (NCF)**
* **Autoencoders**
* **DeepFM**

These models combine:

* User embeddings
* Item embeddings
* Contextual features

#### **2. Reinforcement Learning (RL)**

Uses:

* **Contextual bandits**
* **Reinforcement learning agents**

Purpose:

* Adapt recommendations in real time
* Balance **exploration** (new items) vs **exploitation** (known preferences)

---

If you want, I can also provide:

✅ A **PDF**, **DOCX**, or **PPT** version
✅ A visually designed **presentation-style markdown**
✅ A **diagram/architecture flow** for the recommendation system
