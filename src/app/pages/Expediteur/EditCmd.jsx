import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { toast } from "sonner";
import { Page } from "components/shared/Page";
import { useParams } from "react-router";

export default function EditCmd() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [gouvernoratOptions, setGouvernoratOptions] = useState([]);
  const [villeOptions, setVilleOptions] = useState([]);
  const [localiteOptions, setLocaliteOptions] = useState([]);
  const [localiteFullData, setLocaliteFullData] = useState([]);
  const [allVillesData, setAllVillesData] = useState([]);
  const [commandeData, setCommandeData] = useState(null);
  const [isPrefilled, setIsPrefilled] = useState(false); // Nouvelle variable pour contrôler le pré-remplissage

  const defaultValues = useMemo(() => ({
    nom: "",
    tel: "",
    tel2: "",
    gouvernorat: null,
    ville: null,
    localite: null,
    cp: "",
    adresse: "",
    latitude: null,
    longitude: null,
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
    formState: { errors },
  } = useForm({ defaultValues });

  const watchEchange = watch("echange");
  const watchGouvernorat = watch("gouvernorat");
  const watchVille = watch("ville");
  const watchLocalite = watch("localite");

  const modeOptions = useMemo(() => [
    { id: "1", name: "Espèce seulement" },
    { id: "2", name: "Chèque seulement" },
    { id: "4", name: "Espèce ou chèque" },
  ], []);

  const getAuthToken = () => localStorage.getItem("authToken");

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
    if (!validPrefixes.includes(prefix)) return "Préfixe invalide";
    return true;
  };

  const normalizeString = (str) =>
    str
      ? str
          .toLowerCase()
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
      : "";

  // Calculer les options de délégations
  const filteredDelegations = useMemo(() => {
    if (!watchGouvernorat?.id || !allVillesData.length) return [];
    return allVillesData.filter(item => item.governorate === watchGouvernorat.id);
  }, [watchGouvernorat, allVillesData]);

  const delegations = useMemo(() => {
    return [...new Set(filteredDelegations.map(item => item.delegation))]
      .filter(Boolean)
      .map(delegation => ({ id: delegation, name: delegation }));
  }, [filteredDelegations]);

  // Calculer les options de localités
  const filteredLocalites = useMemo(() => {
    if (!watchGouvernorat?.id || !watchVille?.id || !allVillesData.length) return [];
    return allVillesData.filter(
      item => item.governorate === watchGouvernorat.id && item.delegation === watchVille.id
    );
  }, [watchGouvernorat, watchVille, allVillesData]);

  const localites = useMemo(() => {
    const uniqueLocalites = [...new Set(filteredLocalites.map(item => item.localite))];
    return uniqueLocalites.map(localite => {
      const item = filteredLocalites.find(i => i.localite === localite);
      return { id: item.localite, name: item.localite, cp: item.cp };
    });
  }, [filteredLocalites]);

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      const token = getAuthToken();
      if (!token || !id) {
        toast.error("Authentification ou ID manquant");
        setLoadingData(false);
        return;
      }

      try {
        const [villesRes, commandeRes] = await Promise.all([
          fetch("http://localhost:3000/api/villes", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`http://localhost:3000/api/commandes/${id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!commandeRes.ok) throw new Error(`Erreur ${commandeRes.status}`);

        const [villesData, commandeResponse] = await Promise.all([
          villesRes.json(),
          commandeRes.json(),
        ]);

        const commandeData = commandeResponse.data || commandeResponse;
        console.log("villesData:", villesData);
        console.log("commandeData:", commandeData);

        setAllVillesData(villesData);
        setCommandeData(commandeData);

        // Gouvernorats
        const uniqueGouvernorats = [...new Set(villesData.map(item => item.governorate))]
          .map(gouv => ({ id: gouv, name: gouv }));
        setGouvernoratOptions(uniqueGouvernorats);

        // Pré-remplir les champs simples
        setValue("nom", commandeData.nom || "");
        setValue("tel", commandeData.tel || "");
        setValue("tel2", commandeData.tel2 || "");
        setValue("adresse", commandeData.adresse || "");
        setValue("cp", commandeData.cp || "");
        setValue("latitude", commandeData.latitude || null);
        setValue("longitude", commandeData.longitude || null);
        setValue("designation", commandeData.designation || "");
        setValue("prix", commandeData.prix || "");
        setValue("nb_article", parseInt(commandeData.nb_article) || 1);
        setValue("nb_colis", parseInt(commandeData.nb_colis) || 1);
        setValue("fragile", (commandeData.fragile === 1 || commandeData.fragile === "1") ? "1" : "0");
        setValue("ouvrir", (commandeData.ouvrir === 1 || commandeData.ouvrir === "1" || commandeData.ouvrir === "Oui") ? "Oui" : "Non");
        setValue("echange", (commandeData.echange === 1 || commandeData.echange === "1") ? "1" : "0");
        setValue("designation_echange", commandeData.article || "");
        setValue("nb_echange", commandeData.nb_echange || "");
        setValue("commentaire", commandeData.msg || "");
        setValue("mode", modeOptions.find(m => m.id === String(commandeData.mode)) || null);
      } catch (err) {
        console.error("Erreur chargement commande:", err);
        toast.error("Erreur lors du chargement de la commande");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id, setValue, modeOptions]);

  // Pré-remplir les champs de localisation
  useEffect(() => {
    if (!commandeData || !gouvernoratOptions.length || !allVillesData.length || isPrefilled) return;

    console.log("useEffect pré-remplissage exécuté");
    console.log("gouvernoratOptions:", gouvernoratOptions);

    const gouvernoratOpt = gouvernoratOptions.find(
      g => normalizeString(g.name) === normalizeString(commandeData.gouvernerat)
    );
    if (!gouvernoratOpt) {
      console.log("Gouvernorat non trouvé:", commandeData.gouvernerat);
      return;
    }

    setValue("gouvernorat", gouvernoratOpt);

    const delegationOpt = delegations.find(
      d => normalizeString(d.name) === normalizeString(commandeData.delegation)
    );
    if (!delegationOpt) {
      console.log("Délégation non trouvée:", commandeData.delegation);
      return;
    }

    setValue("ville", delegationOpt);

    const localiteOpt = localites.find(
      l => normalizeString(l.name) === normalizeString(commandeData.ville)
    );
    if (!localiteOpt) {
      console.log("Localité non trouvée:", commandeData.ville);
      return;
    }

    setValue("localite", localiteOpt);
    setValue("cp", localiteOpt.cp);

    console.log("Valeurs définies:", {
      gouvernorat: gouvernoratOpt,
      ville: delegationOpt,
      localite: localiteOpt,
      cp: localiteOpt.cp,
    });

    setIsPrefilled(true); // Marquer le pré-remplissage comme terminé
  }, [commandeData, gouvernoratOptions, allVillesData, delegations, localites, setValue, isPrefilled]);

  // Mettre à jour les options de délégations
  useEffect(() => {
    setVilleOptions(delegations);

    // Ne réinitialiser que si la délégation actuelle n'est plus valide
    if (watchVille && !delegations.find(d => d.id === watchVille.id)) {
      setValue("ville", null);
      setValue("localite", null);
    }

    console.log("useEffect villeOptions exécuté, villeOptions:", delegations);
  }, [delegations, setValue, watchVille]);

  // Mettre à jour les options de localités
  useEffect(() => {
    setLocaliteOptions(localites);
    setLocaliteFullData(filteredLocalites);

    // Ne réinitialiser que si la localité actuelle n'est plus valide
    if (watchLocalite && !localites.find(l => l.id === watchLocalite.id)) {
      setValue("localite", null);
    }

    console.log("useEffect localiteOptions exécuté, localiteOptions:", localites);
  }, [localites, filteredLocalites, setValue, watchLocalite]);

  // Localité → CP
  useEffect(() => {
    if (!watchLocalite?.id || !localiteFullData.length) return;

    const locality = localiteFullData.find(loc => loc.localite === watchLocalite.id);
    if (locality) {
      setValue("cp", locality.cp);
      console.log("useEffect localite → cp exécuté, cp:", locality.cp);
    }
  }, [watchLocalite, localiteFullData, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      toast.error("Veuillez vous connecter.");
      setLoading(false);
      return;
    }

    try {
      const formData = {
        nom: data.nom,
        tel: data.tel,
        tel2: data.tel2,
        gouvernerat: data.gouvernorat?.name || "",
        delegation: data.ville?.name || "", // Corrigé : utiliser data.ville pour délégation
        ville: data.localite?.name || "", // Corrigé : utiliser data.localite pour localité
        cp: data.cp,
        adresse: data.adresse,
        latitude: data.latitude,
        longitude: data.longitude,
        designation: data.designation,
        prix: data.prix,
        nb_article: data.nb_article,
        nb_colis: data.nb_colis,
        mode: data.mode?.id || "",
        fragile: data.fragile === "1" ? 1 : 0,
        ouvrir: data.ouvrir === "Oui" ? 1 : 0,
        echange: data.echange === "1" ? 1 : 0,
        article: data.echange === "1" ? data.designation_echange : "",
        nb_echange: data.echange === "1" ? data.nb_echange : "",
        msg: data.commentaire,
      };

      console.log("formData envoyé à l'API:", formData);

      const res = await fetch(`http://localhost:3000/api/commandes/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const responseData = await res.json();
      console.log("Réponse API:", responseData);

      if (!res.ok) {
        throw new Error(responseData.message || "Échec de la modification");
      }

      toast.success("Commande modifiée avec succès !");
      setTimeout(() => window.history.back(), 1000);
    } catch (err) {
      console.error("Erreur soumission:", err);
      toast.error(err.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Page title="Modifier le colis">
        <div className="w-full p-6 bg-white rounded-xl shadow-md">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Chargement...</div>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Modifier le colis">
      <div className="w-full p-6 bg-white rounded-xl shadow-md">
        <h5 className="text-lg font-semibold text-gray-800 mb-1">Modifier le colis</h5>
        <p className="text-sm text-gray-500 mb-6">Modifiez les informations du colis</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* Informations client */}
          <section className="border-b border-gray-200 pb-6">
            <h6 className="text-base font-semibold text-gray-800 mb-4">Informations client</h6>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Input
                  label="Nom complet"
                  placeholder="Nom complet"
                  {...register("nom", { required: "Le nom est requis" })}
                  error={errors.nom?.message}
                />
              </div>
              <div>
                <Input
                  label="Téléphone"
                  placeholder="Téléphone"
                  {...register("tel", { validate: validatePhoneNumber })}
                  error={errors.tel?.message}
                />
              </div>
              <div>
                <Input
                  label="Téléphone 2"
                  placeholder="Téléphone 2"
                  {...register("tel2")}
                  error={errors.tel2?.message}
                />
              </div>
            </div>
          </section>

          {/* Adresse */}
          <section className="border-b border-gray-200 pb-6">
            <h6 className="text-base font-semibold text-gray-800 mb-4">Adresse de livraison</h6>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="sm:col-span-4">
                <Input
                  label="Adresse"
                  placeholder="Adresse complète"
                  {...register("adresse", { required: "L'adresse est requise" })}
                  error={errors.adresse?.message}
                />
              </div>
              <div>
                <Controller
                  name="gouvernorat"
                  control={control}
                  rules={{ required: "Le gouvernorat est requis" }}
                  render={({ field }) => (
                    <Listbox
                      label="Gouvernorat"
                      placeholder="Sélectionner un gouvernorat"
                      data={gouvernoratOptions}
                      value={field.value}
                      onChange={field.onChange}
                      displayField="name"
                      valueField="id"
                      error={errors.gouvernorat?.message}
                      disabled={gouvernoratOptions.length === 0}
                    />
                  )}
                />
              </div>
              <div>
                <Controller
                  name="ville"
                  control={control}
                  rules={{ required: "La délégation est requise" }}
                  render={({ field }) => (
                    <Listbox
                      label="Délégation"
                      placeholder="Sélectionner une délégation"
                      data={villeOptions}
                      value={field.value}
                      onChange={field.onChange}
                      displayField="name"
                      valueField="id"
                      error={errors.ville?.message}
                      disabled={villeOptions.length === 0}
                    />
                  )}
                />
              </div>
              <div>
                <Controller
                  name="localite"
                  control={control}
                  rules={{ required: "La localité est requise" }}
                  render={({ field }) => (
                    <Listbox
                      label="Localité"
                      placeholder="Sélectionner une localité"
                      data={localiteOptions}
                      value={field.value}
                      onChange={field.onChange}
                      displayField="name"
                      valueField="id"
                      error={errors.localite?.message}
                      disabled={localiteOptions.length === 0}
                    />
                  )}
                />
              </div>
              <div>
                <Input
                  label="Code postal"
                  placeholder="Code postal"
                  {...register("cp", {
                    required: "Le code postal est requis",
                    pattern: { value: /^\d{4}$/, message: "4 chiffres requis" },
                  })}
                  error={errors.cp?.message}
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
                  placeholder="Désignation"
                  {...register("designation", { required: "La désignation est requise" })}
                  error={errors.designation?.message}
                />
              </div>
              <div>
                <Input
                  label="Prix en DT"
                  placeholder="Prix (DT)"
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
                  placeholder="Nombre d'article"
                  type="number"
                  {...register("nb_article", { required: true, valueAsNumber: true })}
                  error={errors.nb_article?.message}
                />
              </div>
              <div>
                <Input
                  label="Nombre de colis"
                  placeholder="Nombre de colis"
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
                rules={{ required: "Le mode est requis" }}
                render={({ field }) => (
                  <Listbox
                    label="Mode de paiement"
                    placeholder="Sélectionner un mode"
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
            <h6 className="text-base font-semibold text-gray-800 mb-4">Options colis</h6>
            <div className="flex flex-col sm:flex-row sm:gap-8">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fragile</label>
                <div className="flex gap-6">
                  {["Non", "Oui"].map((val) => (
                    <label key={val} className="flex items-center">
                      <input
                        type="radio"
                        value={val === "Oui" ? "1" : "0"}
                        {...register("fragile")}
                        className="mr-2"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex-1 mt-4 sm:mt-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ouvrir avant paiement</label>
                <div className="flex gap-6">
                  {["Non", "Oui"].map((val) => (
                    <label key={val} className="flex items-center">
                      <input
                        type="radio"
                        value={val}
                        {...register("ouvrir")}
                        className="mr-2"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex-1 mt-4 sm:mt-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Échange</label>
                <div className="flex gap-6">
                  {["Non", "Oui"].map((val) => (
                    <label key={val} className="flex items-center">
                      <input
                        type="radio"
                        value={val === "Oui" ? "1" : "0"}
                        {...register("echange")}
                        className="mr-2"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {watchEchange === "1" && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Désignation des articles à échanger"
                  placeholder="Désignation"
                  {...register("designation_echange", { required: "Requis si échange" })}
                  error={errors.designation_echange?.message}
                />
                <Input
                  label="Nombre d'articles à échanger"
                  placeholder="Nombre"
                  type="number"
                  {...register("nb_echange", { required: "Requis si échange", valueAsNumber: true })}
                  error={errors.nb_echange?.message}
                />
              </div>
            )}
          </section>

          {/* Commentaire */}
          <section>
            <h6 className="text-base font-semibold text-gray-800 mb-4">Commentaire</h6>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Commentaires supplémentaires"
              {...register("commentaire")}
            />
          </section>

          {/* Boutons */}
          <div className="mt-8 flex justify-end space-x-3">
            <Button type="button" onClick={() => window.history.back()} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" color="primary" disabled={loading}>
              {loading ? "Modification..." : "Modifier"}
            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
}