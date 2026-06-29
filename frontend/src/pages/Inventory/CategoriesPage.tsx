import { useState } from "react";
import { useAppStore } from "../../store/appStore";
import { generateId } from "../../utils/id";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Modal } from "../../components/ui/modal";
import { PlusIcon, PencilIcon, TrashBinIcon, FolderIcon } from "../../icons";

export default function CategoriesPage() {
  const { categories, products } = useAppStore();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const productCountByCategory = (catId: string) =>
    products.filter((p) => p.categoryId === catId).length;

  const handleSave = () => {
    if (!categoryName.trim()) return;

    if (editingId) {
      const newCategories = categories.map((c) =>
        c.id === editingId ? { ...c, name: categoryName.trim() } : c
      );
      useAppStore.setState({ categories: newCategories });
    } else {
      const newCat = {
        id: generateId(),
        name: categoryName.trim(),
      };
      useAppStore.setState({ categories: [...categories, newCat] });
    }

    setShowModal(false);
    setEditingId(null);
    setCategoryName("");
  };

  const handleEdit = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) {
      setEditingId(id);
      setCategoryName(cat.name);
      setShowModal(true);
    }
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      useAppStore.setState({
        categories: categories.filter((c) => c.id !== deleteConfirm),
      });
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <PageMeta
        title="Catégories - SMART NDC"
        description="Gestion des catégories de produits"
      />
      <PageBreadcrumb pageTitle="Catégories" />

      <div className="mb-6 flex items-center justify-end">
        <Button
          onClick={() => {
            setEditingId(null);
            setCategoryName("");
            setShowModal(true);
          }}
          startIcon={<PlusIcon />}
        >
          Ajouter une catégorie
        </Button>
      </div>

      <ComponentCard title="Liste des catégories">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Nom</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Nombre de produits</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <FolderIcon className="h-4 w-4 text-gray-500" />
                      </div>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {cat.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {productCountByCategory(cat.id)} produit{productCountByCategory(cat.id) !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(cat.id)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-800"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(cat.id)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-error-500 dark:hover:bg-gray-800"
                      >
                        <TrashBinIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ComponentCard>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="px-6 py-8 sm:px-10">
          <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </h3>
          <div className="space-y-4">
            <Label htmlFor="catName">Nom de la catégorie</Label>
            <Input
              id="catName"
              placeholder="Ex: PC, Imprimante..."
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!categoryName.trim()}>
              {editingId ? "Enregistrer" : "Ajouter"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <div className="px-6 py-8 text-center sm:px-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/15">
            <TrashBinIcon className="h-6 w-6 text-error-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            Confirmer la suppression
          </h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer cette catégorie ?
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button onClick={handleDelete}>
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
