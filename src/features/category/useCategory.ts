import { useSelector } from "react-redux";
import { CategoryCollection } from "./categoryCollection.model"
import { IRootState } from "../../redux/store";
import { CategoryDefinition } from "./category.model";

export const useCategory = () => {
    const category = useSelector((state: IRootState) => state.category);
    const categoryInstance = CategoryCollection.getInstance();

    const addNewCategory = (category: CategoryDefinition) => {
        categoryInstance.addCategory(category);
    }

    const getCategoryByName = (name: string) => {
        return categoryInstance.getCategoryByName(name);
    }

    const getCategories = () => {
        return categoryInstance.getCategories();
    }

    return {
        category,
        addNewCategory,
        getCategoryByName,
        getCategories
    }
}