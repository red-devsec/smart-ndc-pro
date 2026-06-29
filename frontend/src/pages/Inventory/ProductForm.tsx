import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAppStore } from "../../store/appStore";
import { generateId } from "../../utils/id";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";
import Form from "../../components/form/Form";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories, addProduct, updateProduct } = useAppStore();

  const existing = id ? products.find((p) => p.id === id) : null;

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "");
  const [barcode, setBarcode] = useState(existing?.barcode ?? "");
  const [barcodeFormat, setBarcodeFormat] = useState(existing?.barcodeFormat ?? "EAN-13");
  const [price, setPrice] = useState(existing?.price.toString() ?? "");
  const [quantity, setQuantity] = useState(existing?.quantity.toString() ?? "");
  const [minThreshold, setMinThreshold] = useState(existing?.minThreshold.toString() ?? "5");
  const [location, setLocation] = useState(existing?.location ?? "");

  const isEdit = !!existing;

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const barcodeFormatOptions = [
    { value: "EAN-13", label: "EAN-13" },
    { value: "Code 128", label: "Code 128" },
    { value: "QR Code", label: "QR Code" },
  ];

  const handleSubmit = () => {
    const category = categories.find((c) => c.id === categoryId);
    const productData = {
      id: existing?.id ?? generateId(),
      name,
      description,
      category: category?.name ?? "",
      categoryId,
      barcode,
      barcodeFormat: barcodeFormat as "EAN-13" | "Code 128" | "QR Code",
      price: parseFloat(price) || 0,
      quantity: parseInt(quantity) || 0,
      minThreshold: parseInt(minThreshold) || 0,
      location,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    if (isEdit) {
      updateProduct(id!, productData);
    } else {
      addProduct(productData);
    }
    navigate("/products");
  };

  return (
    <>
      <PageMeta
        title={isEdit ? "Modifier Produit - SMART NDC" : "Ajouter Produit - SMART NDC"}
        description="Formulaire produit"
      />
      <PageBreadcrumb pageTitle={isEdit ? "Modifier le Produit" : "Nouveau Produit"} />

      <ComponentCard title={isEdit ? "Modification du produit" : "Ajout d'un nouveau produit"}>
        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nom du produit</Label>
              <Input
                id="name"
                placeholder="Ex: PC Portable HP EliteBook 840"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <TextArea
                placeholder="Description du produit..."
                value={description}
                onChange={setDescription}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select
                options={categoryOptions}
                placeholder="Sélectionner une catégorie"
                defaultValue={categoryId}
                onChange={setCategoryId}
              />
            </div>

            <div>
              <Label htmlFor="location">Emplacement</Label>
              <Input
                id="location"
                placeholder="Ex: A1-01"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="barcode">Code-barres</Label>
              <Input
                id="barcode"
                placeholder="Ex: 8712345678900"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="barcodeFormat">Format code-barres</Label>
              <Select
                options={barcodeFormatOptions}
                placeholder="Format"
                defaultValue={barcodeFormat}
                onChange={(v) => setBarcodeFormat(v as "EAN-13" | "Code 128" | "QR Code")}
              />
            </div>

            <div>
              <Label htmlFor="price">Prix (MAD)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantité initiale</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="minThreshold">Seuil minimum</Label>
              <Input
                id="minThreshold"
                type="number"
                placeholder="5"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/products")}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              {isEdit ? "Enregistrer" : "Ajouter le produit"}
            </Button>
          </div>
        </Form>
      </ComponentCard>
    </>
  );
}
