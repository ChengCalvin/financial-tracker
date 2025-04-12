import { categorySlice } from "../../redux/category.slice";
import { store } from "../../redux/store";
import { CategoryDefinition, CategoryModel } from "./category.model";

export class CategoryCollection {
    static instance: CategoryCollection;
    private categories: CategoryModel[];

    constructor() {
        this.categories = [];
    }

    addCategory(category: CategoryDefinition) {
        const newCategory = new CategoryModel(category);
        this.categories = [...this.categories, newCategory];
    }

    getCategoryByName(name: string) {
        return this.categories.find(category => category.name === name);
    }

    getCategories() {
        return this.categories;
    }

    static getInstance() {
        if (!CategoryCollection.instance) {
            CategoryCollection.instance = new CategoryCollection();
        }
        return CategoryCollection.instance;
    }

    update() {
        store.dispatch(categorySlice.actions.update(this.getState()));
    }

    getState() {
        return {
            categories: this.categories,
        };
    }
}