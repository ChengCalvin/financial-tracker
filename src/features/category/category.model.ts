export interface CategoryDefinition {
    id: number;
    name: string;
    // description: string;
    // products: Product[];
}

export interface CategoryState {
    id: number;
    name: string;
    // description: string;
    // products: Product[];
}

export class CategoryModel {
    id: number;
    name: string;
    // description: string;
    // products: Product[];

    constructor(category: CategoryDefinition) {
        this.id = category.id;
        this.name = category.name;
        // this.description = category.description;
        // this.products = category.products;
    }

    getId() {
        return this.id;
    }

    setId(id: number) {
        this.id = id;
    }

    getName() {
        return this.name;
    }

    setName(name: string) {
        this.name = name;
    }

    // getDescription() {
    //     return this.description;
    // }

    // setDescription(description: string) {
    //     this.description = description;
    // }

    getState(): CategoryState {
        return {
            id: this.getId(),
            name: this.getName(),
            // description: this.description,
            // products: this.products,
        }
    }

}