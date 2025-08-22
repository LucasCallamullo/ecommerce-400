

window.BrandStore = {
    loaded: false,
    data: [],
    setData(brands, flagComplete=false) {
        this.data = brands;
        if (brands.length > 0 && flagComplete) this.loaded = true;
    },

    getData() {
        return this.data;
    },

    getBrandById(id) {
        return this.data.find(b => b.id === id);
    }
};


window.CategoriesStore = {
    loaded: false,
    data: [],

    /**
     * Sets the categories data.
     * @param {Array} categories - Array of objects { category: {...}, subcategories: [...] }
     */
    setData(categories, flagComplete=false) {
        this.data = categories;
        if (categories.length > 0 && flagComplete) this.loaded = true;
    },
    
    getData() {
        return this.data;
    },

    /**
     * Returns all categories (top-level only).
     * @returns {Array} - Array of category objects
     */
    getCategories() {
        return this.data.map(c => c.category);
    },

    /**
     * Returns all subcategories flattened in a single array.
     * @returns {Array} - Array of subcategory objects
     */
    getAllSubcategories() {
        return this.data.flatMap(c => c.subcategories);
    },

    /**
     * Find a category by its ID.
     * @param {number} id - Category ID
     * @returns {Object|null} - Category object or null
     */
    getCategoryById(id) {
        const catObj = this.data.find(c => c.category.id === id);
        return catObj ? catObj.category : null;
    },

    /**
     * Find a subcategory by its ID.
     * @param {number} id - Subcategory ID
     * @returns {Object|null} - Subcategory object or null
     */
    getSubcategoryById(id) {
        for (const c of this.data) {
            const sub = c.subcategories.find(s => s.id === id);
            if (sub) return sub;
        }
        return null;
    },

    /**
     * Get the category object containing a given subcategory ID
     * @param {number} subId - Subcategory ID
     * @returns {Object|null} - Category object or null
     */
    getCategoryBySubcategoryId(subId) {
        const catObj = this.data.find(c => c.subcategories.some(s => s.id === subId));
        return catObj ? catObj.category : null;
    },
    getSubcategoryWithFallback(subId) {
        // Try to find the subcategory anywhere
        let sub = this.getSubcategoryById(subId);
        if (sub) return sub;

        // Fallback: search inside the default category
        const defaultCategory = this.getCategories().find(c => c.is_default);
        if (defaultCategory) {
            sub = this.getSubcategoriesForCategory(defaultCategory.id)
                    .find(sc => sc.id === subId);
        }

        return sub || null;
    },


    /**
     * Get subcategories for a specific category ID
     * @param {number} categoryId
     * @returns {Array} - Array of subcategory objects
     */
    getSubcategoriesForCategory(categoryId) {
        const catObj = this.data.find(c => c.category.id === categoryId);
        return catObj ? catObj.subcategories : [];
    }
};
