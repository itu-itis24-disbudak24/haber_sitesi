// script.js

document.addEventListener('DOMContentLoaded', () => {
    const newsGrid = document.getElementById('haberler-listesi');
    const addArticleBtn = document.getElementById('addArticleBtn');

    // Haber verilerini yükleme fonksiyonu (Gerçek projede fetch kullanılır)
    async function loadArticles() {
        try {
            // JSON dosyasını yükle. Yerel sunucuda çalıştırıldığında bu düzgün çalışır.
            const response = await fetch('articles.json');
            if (!response.ok) {
                throw new Error(`HTTP hatası! Durum: ${response.status}`);
            }
            const articles = await response.json();
            
            // Haberleri ekrana yazdır
            articles.forEach(article => renderArticle(article));

        } catch (error) {
            console.error("Haberler yüklenirken bir hata oluştu:", error);
            newsGrid.innerHTML = `<p style="color: red; grid-column: 1 / -1;">Haberler yüklenemedi. Lütfen sunucu bağlantınızı kontrol edin.</p>`;
        }
    }

    /**
     * Tek bir haber kartını oluşturur ve DOM'a ekler.
     * @param {object} article - Haber nesnesi
     */
    function renderArticle(article) {
        const card = document.createElement('div');
        card.classList.add('article-card');
        // Rastgele ID ekleme (dinamik eklenenler için)
        const articleId = article.id || Date.now(); 

        const articleHTML = `
            <a href="#haber-${articleId}" class="article-link" aria-label="${article.title} haberini oku">
                <div class="article-image">
                    <img src="${article.imageUrl}" alt="${article.title}">
                </div>
                <div class="article-content">
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-summary">${article.summary}</p>
                    <div class="article-meta">
                        <span class="article-date">${formatDate(article.date)}</span>
                        <span class="article-category">${article.category || 'Genel'}</span>
                    </div>
                </div>
            </a>
        `;
        
        card.innerHTML = articleHTML;
        newsGrid.appendChild(card);
    }
    
    // Tarih formatlama fonksiyonu (YYYY-MM-DD -> DD.MM.YYYY)
    function formatDate(dateString) {
        if (!dateString) return 'Tarih Yok';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        // Tarih formatını yerel Türkçeye çevirir
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    }

    // --- Dinamik Haber Ekleme Fonksiyonu (Geliştirici Özelliği) ---
    addArticleBtn.addEventListener('click', () => {
        addNewRandomArticle();
    });

    function addNewRandomArticle() {
        const dummyData = {
            id: Date.now(),
            title: `Geliştirici Tarafından Eklenen Yeni Başlık ${Math.floor(Math.random() * 100)}`,
            summary: `Bu içerik, ${formatDate(new Date().toISOString().split('T')[0])} tarihinde JavaScript ile dinamik olarak oluşturulmuştur.`,
            imageUrl: `https://via.placeholder.com/600x400?text=Dinamik+Haber+${Math.floor(Math.random() * 1000)}`,
            date: new Date().toISOString().split('T')[0],
            category: "Gündem"
        };
        
        // Yeni kartı en üste eklemek için prepend kullanıyoruz
        const tempContainer = document.createElement('div');
        renderArticle(dummyData);
        
        // Yeni eklenen kartı en başa taşımak için DOM manipülasyonu (append yerine prepend kullanılır)
        const newCard = newsGrid.lastElementChild; // RenderArticle en son eklediği için
        newsGrid.prepend(newCard);

        alert("Yeni dinamik haber en üste eklendi!");
    }


    // Uygulama başlangıcı: Haberleri yükle
    loadArticles();
});