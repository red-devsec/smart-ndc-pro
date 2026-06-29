import { useState, useEffect, FormEvent, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useAppStore } from "../../store/appStore";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { PlusIcon } from "../../icons";
import { uploadApi } from "../../services/api";

const departments = [
  { value: "d1", label: "Direction" },
  { value: "d2", label: "Commercial" },
  { value: "d3", label: "Technique" },
  { value: "d4", label: "RH & Administration" },
  { value: "d5", label: "Logistique" },
  { value: "d6", label: "Finance" },
];

const departmentNames: Record<string, string> = {
  d1: "Direction",
  d2: "Commercial",
  d3: "Technique",
  d4: "RH & Administration",
  d5: "Logistique",
  d6: "Finance",
};

function generateId() {
  return `e${Date.now()}`;
}

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees, rfidCards, addEmployee, updateEmployee } = useAppStore();
  const isEditing = Boolean(id);

  const existing = isEditing ? employees.find((e) => e.id === id) : null;

  const [firstName, setFirstName] = useState(existing?.firstName || "");
  const [lastName, setLastName] = useState(existing?.lastName || "");
  const [email, setEmail] = useState(existing?.email || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [position, setPosition] = useState(existing?.position || "");
  const [departmentId, setDepartmentId] = useState(existing?.departmentId || "");
  const [hireDate, setHireDate] = useState(existing?.hireDate || "");
  const [salary, setSalary] = useState(existing?.salary?.toString() || "");
  const [rfidCardId, setRfidCardId] = useState(existing?.rfidCardId || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(existing?.photo || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existing) {
      setFirstName(existing.firstName);
      setLastName(existing.lastName);
      setEmail(existing.email);
      setPhone(existing.phone);
      setPosition(existing.position);
      setDepartmentId(existing.departmentId);
      setHireDate(existing.hireDate);
      setSalary(existing.salary.toString());
      setRfidCardId(existing.rfidCardId || "");
      setPhotoPreview(existing.photo || "");
    }
  }, [existing]);

  const unassignedCards = rfidCards.filter(
    (c) => c.isActive && (!c.employeeId || c.employeeId === existing?.id)
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !departmentId) return;

    setUploading(true);
    try {
      let photoUrl = photoPreview;
      if (photoFile) {
        const result = await uploadApi.employeePhoto(photoFile);
        photoUrl = result.url;
      }

      const depName = departmentNames[departmentId] || departmentId;
      const card = rfidCards.find((c) => c.id === rfidCardId);

      if (isEditing && existing) {
        updateEmployee(existing.id, {
          firstName, lastName, email, phone, position,
          departmentId, departmentName: depName, hireDate,
          salary: Number.parseFloat(salary) || 0,
          rfidCardId: rfidCardId || undefined,
          cardUid: card?.uid,
          photo: photoUrl || undefined,
        });
      } else {
        addEmployee({
          id: generateId(),
          firstName, lastName, email, phone, position,
          departmentId, departmentName: depName, hireDate,
          salary: Number.parseFloat(salary) || 0,
          rfidCardId: rfidCardId || undefined,
          cardUid: card?.uid,
          photo: photoUrl || undefined,
          isActive: true,
          createdAt: new Date().toISOString(),
        });
      }

      navigate("/employees");
    } catch (err) {
      console.error("Erreur lors de l'upload photo:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <PageMeta
        title={`${isEditing ? "Modifier" : "Ajouter"} un Employé - SMART NDC`}
        description="Formulaire d'ajout et modification d'employé"
      />
      <PageBreadcrumb pageTitle={isEditing ? "Modifier l'employé" : "Ajouter un employé"} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-5 py-7 sm:px-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  placeholder="Prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  placeholder="Nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  placeholder="+212 6XX XX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="position">Poste</Label>
                <Input
                  id="position"
                  placeholder="Poste"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="department">Département</Label>
                <Select
                  options={departments}
                  placeholder="Sélectionner un département"
                  defaultValue={departmentId}
                  onChange={(v) => setDepartmentId(v)}
                />
              </div>
              <div>
                <Label htmlFor="hireDate">Date d'embauche</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="salary">Salaire (DH)</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="0"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Photo</Label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-brand-500 dark:border-gray-600 dark:bg-gray-800"
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Prévisualisation" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                    )}
                  </div>
                  <div>
                    <button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                      {photoPreview ? "Changer la photo" : "Ajouter une photo"}
                    </button>
                    {photoPreview && (
                      <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(""); }} className="ml-2 text-sm text-red-500 hover:underline">
                        Supprimer
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }
                  }} />
                </div>
              </div>
              <div>
                <Label htmlFor="rfidCard">Carte RFID</Label>
                <Select
                  options={[
                    { value: "", label: "Aucune carte" },
                    ...unassignedCards.map((c) => ({
                      value: c.id,
                      label: `${c.uid}${c.employeeName ? ` (${c.employeeName})` : ""}`,
                    })),
                  ]}
                  placeholder="Sélectionner une carte"
                  defaultValue={rfidCardId}
                  onChange={(v) => setRfidCardId(v)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => navigate("/employees")}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
              >
                <PlusIcon />
                {uploading ? "Upload..." : isEditing ? "Mettre à jour" : "Ajouter l'employé"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
