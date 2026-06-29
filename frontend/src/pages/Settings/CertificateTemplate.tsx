import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { uploadApi } from "../../services/api";
import api from "../../services/api";

export default function CertificateTemplate() {
  const [companyName, setCompanyName] = useState("SMART NDC Pro");
  const [companySubtitle, setCompanySubtitle] = useState("Nouvelles Ducasses Confiserie Maroc");
  const [companyPhone, setCompanyPhone] = useState("Bureau : +212 5XX XX XX XX");
  const [companyEmail, setCompanyEmail] = useState("rh@smartndc.ma");
  const [city, setCity] = useState("Casablanca");
  const [primaryColor, setPrimaryColor] = useState("#465FFF");
  const [signatureText, setSignatureText] = useState("SMART NDC Pro");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/settings/template").then((r) => {
      const d = r.data.data;
      if (d) {
        if (d.companyName) setCompanyName(d.companyName);
        if (d.companySubtitle) setCompanySubtitle(d.companySubtitle);
        if (d.companyPhone) setCompanyPhone(d.companyPhone);
        if (d.companyEmail) setCompanyEmail(d.companyEmail);
        if (d.city) setCity(d.city);
        if (d.primaryColor) setPrimaryColor(d.primaryColor);
        if (d.signatureText) setSignatureText(d.signatureText);
        if (d.logoUrl) setLogoUrl(d.logoUrl);
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/settings/template", {
        companyName, companySubtitle, companyPhone, companyEmail,
        city, primaryColor, signatureText, logoUrl,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Erreur sauvegarde template:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const result = await uploadApi.file(f, "logos");
      setLogoUrl(result.url);
    } catch (err) {
      console.error("Erreur upload logo:", err);
    }
  };

  return (
    <>
      <PageMeta title="Personnalisation des Attestations - SMART NDC" description="Personnalisez les templates d'attestations PDF" />
      <PageBreadcrumb pageTitle="Personnalisation des Attestations" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Template d'attestation</h3>
          <p className="mt-1 text-sm text-gray-500">Personnalisez les informations qui apparaissent sur les attestations PDF générées.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Nom de l'entreprise</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <Label>Sous-titre</Label>
            <Input value={companySubtitle} onChange={(e) => setCompanySubtitle(e.target.value)} />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
          </div>
          <div>
            <Label>Ville</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <Label>Texte de signature</Label>
            <Input value={signatureText} onChange={(e) => setSignatureText(e.target.value)} />
          </div>
          <div>
            <Label>Couleur principale</Label>
            <div className="flex items-center gap-3">
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded border border-gray-300 p-1 dark:border-gray-700" />
              <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              {logoUrl && <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded object-contain border" />}
              <label className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                {logoUrl ? "Changer" : "Uploader"}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          {saved && <span className="text-sm text-green-600">✓ Enregistré</span>}
        </div>
      </div>
    </>
  );
}
