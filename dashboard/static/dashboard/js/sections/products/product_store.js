

window.ProductStore = {
    data: [],
    setData(newData) {
        /**
         * Sets the internal product data store.
         *
         * @param {Array} newData - An array of product objects to be stored.
         */
        this.data = newData;
    },
    getData() {
        /**
         * Returns the current product data.
         *
         * @returns {Array} - The array of stored product objects.
         */
        return this.data;
    },

    orderByPrice(desc = false) {
        /**
         * Sorts the product list by price.
         *
         * @param {boolean} desc - If true, sorts by descending price (highest to lowest).
         *                         If false, sorts by ascending price (lowest to highest).
         * @returns {Array} - A new array of products sorted by price.
         */
        return this.data.sort((a, b) =>
            desc ? b.price - a.price : a.price - b.price
        );
    },
    orderByName(asc = true) {
        /**
         * Sorts the product list alphabetically by name.
         *
         * @param {boolean} asc - If true, sorts ascending (A-Z). If false, sorts descending (Z-A).
         * @returns {Array} - A new array of products sorted by name.
         */
        return this.data.sort((a, b) => {
            return asc 
                ? a.name.localeCompare(b.name)   // Ascending
                : b.name.localeCompare(a.name);  // Descending
        });
    },
    orderByCategory(desc = false) {
        /**
         * Sorts the product list by category name alphabetically.
         *
         * @param {boolean} desc - If true, sorts Z-A.
         *                         If false, sorts A-Z.
         * @returns {Array} - The array of products sorted by category name.
         */
        const categoriesMap = Object.fromEntries(
            window.CategoriesStore.getCategories().map(cat => [cat.id, cat])
        );

        return this.data.sort((a, b) => {
            const aName = categoriesMap[a.category_id]?.name || '';    // fallback si category es null
            const bName = categoriesMap[b.category_id]?.name || '';
            return desc ? bName.localeCompare(aName) : aName.localeCompare(bName);
        });
    },
    orderByStock(asc = true) {
        /**
         * Sorts the product list by stock quantity (integer).
         *
         * @param {boolean} asc - If true, sorts ascending (lowest stock first).
         *                        If false, sorts descending (highest stock first).
         * @returns {Array} - A new array of products sorted by stock.
         */
        return this.data.sort((a, b) => {
            return asc ? a.stock - b.stock : b.stock - a.stock;
        });
    },
    orderByUpdatedAt(asc = true) {
        /**
         * Sorts the product list by last update date.
         *
         * NOTE: Assumes `updated_at` is either a Date object or an ISO string (e.g. "2025-08-18T10:30:00").
         * If it's a string, JavaScript Date parsing will handle it.
         *
         * @param {boolean} asc - If true, sorts from oldest to newest.
         *                        If false, sorts from newest to oldest.
         * @returns {Array} - A new array of products sorted by update date.
         */
        return this.data.sort((a, b) => {
            const dateA = new Date(a.updated_at);
            const dateB = new Date(b.updated_at);
            return asc ? dateA - dateB : dateB - dateA;
        });
    },
    orderBySales(asc = true) {
        /**
         * Sorts the product list by number of sales (integer).
         *
         * @param {boolean} asc - If true, sorts ascending (lowest sales first).
         *                        If false, sorts descending (highest sales first).
         * @returns {Array} - A new array of products sorted by sales.
         */
        // in the future we replace ID for SALES
        return this.data.sort((a, b) => {
            return asc ? a.id - b.id : b.id - a.id;
        });
    },

    orderByAvailable(asc = true) {
        /**
         * Sorts the product list by availability (boolean).
         *
         * NOTE: In JavaScript, `true` is treated as 1 and `false` as 0.
         * This means available items can be grouped first or last.
         *
         * @param {boolean} asc - If true, puts NOT available (false) first, then available (true).
         *                        If false, puts available (true) first, then NOT available (false).
         * @returns {Array} - A new array of products sorted by availability.
         */
        return this.data.sort((a, b) => {
            return asc ? (a.available - b.available) : (b.available - a.available);
        });
    },

    filterByName(query) {
        /**
         * Filters the product list based on a search query.
         * The query is split into words, and each word must be included in the product name.
         * The comparison is case-insensitive.
         *
         * @param {string} query - The search string to filter product names.
         * @returns {Array} - A filtered array of products whose names contain all words in the query.
         */
        if (!query) return this.data;

        const words = query.toLowerCase().split(/\s+/); // split by whitespace
        return this.data.filter(p => {
            const name = p.name.toLowerCase();
            return words.every(word => name.includes(word)); // all words must be found
        });
    },

    getProductById(productId) {
        return this.data.find(p => p.id === productId);
    },
};