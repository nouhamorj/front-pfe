// src/app/pages/Agence/ModifCmd.jsx
import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { toast } from "sonner";
import { Page } from "components/shared/Page";

export default function EditCmd() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [commandeData, setCommandeData] = useState(null);

  // Valeurs par défaut (sans localisation)
  const defaultValues = useMemo(() => ({
    code: "",
    nom: "",
    tel: "",
    tel2: "",
    designation: "",
    prix: "",
    nb_article: 1,
    nb_colis: 1,
    mode: null,
    fragile: "0",
    ouvrir: "Non",
    echange: "0",
    designation_echange: "",
    nb_echange: "",
    commentaire: "",
  }), []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues });

  const watchEchange = watch("echange");

  const modeOptions = useMemo(() => [
    { id: "1", name: "Espèce seulement" },
    { id: "2", name: "Chèque seulement" },
    { id: "4", name: "Espèce ou chèque" },
  ], []);

  const getAuthToken = () => localStorage.getItem("authToken");

  // Validation téléphone
  const validatePhoneNumber = (value) => {
    if (!value) return "Le téléphone est requis";
    const cleaned = value.replace(/\D/g, "");
    if (!/^\d{8}$/.test(cleaned)) return "8 chiffres requis";
    const prefix = cleaned.substring(0, 2);
    const validPrefixes = [
      "20", "21", "22", "23", "24", "25", "26", "27", "28", "29",
      "50", "51", "52", "53", "54", "55", "56", "57", "58",
      "90", "91", "92", "93", "94", "95", "96", "97", "98", "99",
      "70", "71", "72", "73", "74", "75", "76", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "77",
    ];
    return validPrefixes.includes(prefix) ? true : "Préfixe invalide";
  };

  // 🔍 Rechercher la commande
  const handleSearch = async (data) => {
    const token = getAuthToken();
    if (!token) return toast.error("Non authentifié");
    if (!data.code) return toast.error("Veuillez saisir un code");

    setLoadingData(true);
    try {
      const res = await fetch(`http://localhost:3000/api/commandes/bycode/${data.code}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await res.json();

      if (!responseData || !responseData.data) {
        throw new Error("Commande non trouvée");
      }

      const cmd = responseData.data;
      setCommandeData(cmd);

      // ✅ Sauvegarder le code actuel
      const currentCode = data.code;

      // Réinitialiser tous les champs SAUF le code
      reset({
        code: currentCode, // ✅ Garder le code
        nom: cmd.nom || "",
        tel: cmd.tel || "",
        tel2: cmd.tel2 || "",
        designation: cmd.designation || "",
        prix: cmd.prix || "",
        nb_article: parseInt(cmd.nb_article) || 1,
        nb_colis: parseInt(cmd.nb_colis) || 1,
        fragile: (cmd.fragile === 1 || cmd.fragile === "1") ? "1" : "0",
        ouvrir: (cmd.ouvrir === 1 || cmd.ouvrir === "1" || cmd.ouvrir === "Oui") ? "Oui" : "Non",
        echange: (cmd.echange === 1 || cmd.echange === "1") ? "1" : "0",
        designation_echange: cmd.article || "",
        nb_echange: cmd.nb_echange || "",
        commentaire: cmd.msg || "",
        mode: modeOptions.find(m => m.id === String(cmd.mode)) || null,
      });

    } catch (error) {
      console.error("Erreur recherche commande:", error);
      toast.error("Commande non trouvée");
      setCommandeData(null);
      // ✅ Garder le code même en cas d'erreur
      setValue("code", data.code);
    } finally {
      setLoadingData(false);
    }
  };

  // ✅ Soumettre la modification (sans données de localisation)
  const onSubmit = async (formData) => {
    if (!commandeData) return;

    setLoading(true);
    const token = getAuthToken();

    try {
      const payload = {
        nom: formData.nom,
        tel: formData.tel,
        tel2: formData.tel2,
        // 🔒 Conserver toutes les données de localisation d'origine
        gouvernerat: commandeData.gouvernerat,
        delegation: commandeData.delegation,
        ville: commandeData.ville,
        cp: commandeData.cp,
        adresse: commandeData.adresse,
        latitude: commandeData.latitude,
        longitude: commandeData.longitude,
        designation: formData.designation,
        prix: formData.prix,
        nb_article: formData.nb_article,
        nb_colis: formData.nb_colis,
        mode: formData.mode?.id || "",
        fragile: formData.fragile === "1" ? 1 : 0,
        ouvrir: formData.ouvrir === "Oui" ? 1 : 0,
        echange: formData.echange === "1" ? 1 : 0,
        article: formData.echange === "1" ? formData.designation_echange : "",
        nb_echange: formData.echange === "1" ? formData.nb_echange : "",
        msg: formData.commentaire,
      };

      const res = await fetch(`http://localhost:3000/api/commandes/update/${commandeData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Échec de la modification");

      toast.success("Commande modifiée avec succès !");
    } catch (error) {
      toast.error(error.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fonction de réinitialisation qui garde le code
  const handleReset = () => {
    if (!commandeData) return;
    
    const currentCode = getValues("code"); // Récupérer le code actuel
    
    reset({
      code: currentCode, // ✅ Garder le code
      nom: commandeData.nom,
      tel: commandeData.tel,
      tel2: commandeData.tel2,
      designation: commandeData.designation,
      prix: commandeData.prix,
      nb_article: commandeData.nb_article,
      nb_colis: commandeData.nb_colis,
      mode: modeOptions.find(m => m.id === String(commandeData.mode)) || null,
      fragile: (commandeData.fragile === 1 || commandeData.fragile === "1") ? "1" : "0",
      ouvrir: (commandeData.ouvrir === 1 || commandeData.ouvrir === "1" || commandeData.ouvrir === "Oui") ? "Oui" : "Non",
      echange: (commandeData.echange === 1 || commandeData.echange === "1") ? "1" : "0",
      designation_echange: commandeData.article || "",
      nb_echange: commandeData.nb_echange || "",
      commentaire: commandeData.msg || "",
    });
  };

  return (
    <Page title="Modifier un colis">
      <div className="w-full max-w-8xl mx-auto p-6 bg-white rounded-xl shadow-md">
        <h5 className="text-lg font-semibold text-gray-800 mb-1">Modifier un colis</h5>
        <p className="text-sm text-gray-500 mb-6">Recherchez un colis par code à barres</p>

        {/* Recherche par code à barres */}
        <div className="mb-8 p-5 bg-gray-50 rounded-lg border">
          <form onSubmit={handleSubmit(handleSearch)} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Code à barres</label>
              <Input
                placeholder="Saisir le code"
                {...register("code", { required: "Le code est requis" })}
                error={errors.code?.message}
                disabled={loadingData}
              />
            </div>
            <Button type="submit" color="success" disabled={loadingData}>
              {loadingData ? "Recherche..." : "Rechercher"}
            </Button>
          </form>
        </div>

        {/* ✏️ Formulaire de modification (SANS localisation) */}
        {commandeData && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Informations client */}
            <section className="border-b border-gray-200 pb-6">
              <h6 className="text-base font-semibold text-gray-800 mb-4">Informations client</h6>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Input
                    label="Nom complet"
                    {...register("nom", { required: "Le nom est requis" })}
                    error={errors.nom?.message}
                  />
                </div>
                <div>
                  <Input
                    label="Téléphone"
                    {...register("tel", { validate: validatePhoneNumber })}
                    error={errors.tel?.message}
                  />
                </div>
                <div>
                  <Input
                    label="Téléphone 2"
                    {...register("tel2")}
                    error={errors.tel2?.message}
                  />
                </div>
              </div>
            </section>

            {/* Informations colis */}
            <section className="border-b border-gray-200 pb-6">
              <h6 className="text-base font-semibold text-gray-800 mb-4">Informations colis</h6>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Désignation"
                    {...register("designation", { required: "Requis" })}
                    error={errors.designation?.message}
                  />
                </div>
                <div>
                  <Input
                    label="Prix en DT"
                    type="number"
                    step="0.001"
                    {...register("prix", { required: true, valueAsNumber: true })}
                    error={errors.prix?.message}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
                <div>
                  <Input
                    label="Nombre d'article"
                    type="number"
                    {...register("nb_article", { required: true, valueAsNumber: true })}
                    error={errors.nb_article?.message}
                  />
                </div>
                <div>
                  <Input
                    label="Nombre de colis"
                    type="number"
                    {...register("nb_colis", { required: true, valueAsNumber: true })}
                    error={errors.nb_colis?.message}
                  />
                </div>
              </div>
            </section>

            {/* Mode de paiement */}
            <section className="border-b border-gray-200 pb-6">
              <h6 className="text-base font-semibold text-gray-800 mb-4">Mode de paiement</h6>
              <div className="sm:w-1/3">
                <Controller
                  name="mode"
                  control={control}
                  rules={{ required: "Requis" }}
                  render={({ field }) => (
                    <Listbox
                      label="Mode"
                      data={modeOptions}
                      value={field.value}
                      onChange={field.onChange}
                      displayField="name"
                      valueField="id"
                      error={errors.mode?.message}
                    />
                  )}
                />
              </div>
            </section>

            {/* Options colis */}
            <section className="border-b border-gray-200 pb-6">
              <h6 className="text-base font-semibold text-gray-800 mb-4">Options</h6>
              <div className="flex flex-col sm:flex-row gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fragile</label>
                  {["Non", "Oui"].map((val) => (
                    <label key={val} className="mr-4">
                      <input type="radio" value={val === "Oui" ? "1" : "0"} {...register("fragile")} className="mr-1" />
                      {val}
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ouvrir avant paiement</label>
                  {["Non", "Oui"].map((val) => (
                    <label key={val} className="mr-4">
                      <input type="radio" value={val} {...register("ouvrir")} className="mr-1" />
                      {val}
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Échange</label>
                  {["Non", "Oui"].map((val) => (
                    <label key={val} className="mr-4">
                      <input type="radio" value={val === "Oui" ? "1" : "0"} {...register("echange")} className="mr-1" />
                      {val}
                    </label>
                  ))}
                </div>
              </div>

              {watchEchange === "1" && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Désignation à échanger"
                    {...register("designation_echange", { required: "Requis si échange" })}
                    error={errors.designation_echange?.message}
                  />
                  <Input
                    label="Nombre à échanger"
                    type="number"
                    {...register("nb_echange", { required: "Requis si échange", valueAsNumber: true })}
                    error={errors.nb_echange?.message}
                  />
                </div>
              )}
            </section>

            {/* Commentaire */}
            <section>
              <h6 className="text-base font-semibold text-gray-800 mb-2">Commentaire</h6>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("commentaire")}
              />
            </section>

            {/* Boutons */}
            <div className="mt-8 flex justify-end gap-3">
              <Button
                type="button"
                onClick={handleReset}
                disabled={loading}
              >
                Réinitialiser
              </Button>
              <Button type="submit" color="primary" disabled={loading}>
                {loading ? "Modification..." : "Modifier"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Page>
  );
}