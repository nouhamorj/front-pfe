import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { toast } from "sonner";
import { Page } from "components/shared/Page";

export default function AddCmd() {
  const [loading, setLoading] = useState(false);
  const [gouvernoratOptions, setGouvernoratOptions] = useState([]);
  const [villeOptions, setVilleOptions] = useState([]);
  const [localiteOptions, setLocaliteOptions] = useState([]);
  const [localiteFullData, setLocaliteFullData] = useState([]);
  const [expediteurName, setExpediteurName] = useState("");
  const [idAgence, setIdAgence] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
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
    },
  });

  const watchGouvernorat = watch("gouvernorat");
  const watchVille = watch("ville");
  const watchLocalite = watch("localite");
  const watchEchange = watch("echange", "0");

  const modeOptions = [
    { id: "1", name: "Espèce seulement" },
    { id: "2", name: "Chèque seulement" },
    { id: "4", name: "Espèce ou chèque" },
  ];

  const getAuthToken = () => localStorage.getItem("authToken");

  const decodeToken = useCallback((token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Decode token error:", err);
      return null;
    }
  }, []);

  // Débogage des erreurs de validation
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form errors:", errors);
    }
  }, [errors]);

  // Charger gouvernorats
  useEffect(() => {
    async function fetchGouvernorats() {
      const token = getAuthToken();
      if (!token) {
        toast.error("Veuillez vous connecter.");
        return;
      }
      try {
        const res = await fetch("http://localhost:3000/api/villes", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log("API /villes response:", data);
        const uniqueGouvernorats = [...new Set(data.map((item) => item.governorate))].map((gouv) => ({
          id: gouv,
          name: gouv,
        }));
        setGouvernoratOptions(uniqueGouvernorats);
      } catch (err) {
        console.error("Erreur chargement gouvernorats:", err);
        toast.error("Erreur chargement gouvernorats");
      }
    }
    fetchGouvernorats();
  }, []);

  // Charger le nom de l'expéditeur
  useEffect(() => {
    async function fetchExpediteurName() {
      const token = getAuthToken();
      const decoded = decodeToken(token);
      if (!token || !decoded?.relatedId) return;
      try {
        const res = await fetch(`http://localhost:3000/api/expediteurs/${decoded.relatedId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const expediteurData = await res.json();
        console.log("Expediteur data:", expediteurData);
        setExpediteurName(expediteurData.nom_page || "Expéditeur");
        setIdAgence(expediteurData.id_agence || null);
      } catch (err) {
        console.error("Erreur chargement expéditeur:", err);
        setExpediteurName("Expéditeur");
        setIdAgence(null);
      }
    }
    fetchExpediteurName();
  }, [decodeToken]);

  // Charger villes selon le gouvernorat sélectionné
  useEffect(() => {
    async function fetchVilles() {
      if (!watchGouvernorat?.id) {
        setVilleOptions([]);
        setLocaliteOptions([]);
        setLocaliteFullData([]);
        setValue("ville", null);
        setValue("localite", null);
        setValue("cp", "");
        return;
      }
      const token = getAuthToken();
      try {
        const res = await fetch("http://localhost:3000/api/villes", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const filteredVilles = data.filter((item) => item.governorate === watchGouvernorat.id);
        console.log("Filtered villes for", watchGouvernorat.id, ":", filteredVilles);
        const uniqueVilles = [...new Set(filteredVilles.map((item) => item.delegation))].map((ville) => ({
          id: ville,
          name: ville,
        }));
        setVilleOptions(uniqueVilles);
        setValue("ville", null);
        setValue("cp", "");
      } catch (err) {
        console.error("Erreur chargement villes:", err);
        toast.error("Erreur chargement villes");
      }
    }
    fetchVilles();
  }, [watchGouvernorat, setValue]);

  // Charger localités selon la ville sélectionnée
  useEffect(() => {
    async function fetchLocalites() {
      if (!watchVille?.id || !watchGouvernorat?.id) {
        setLocaliteOptions([]);
        setLocaliteFullData([]);
        setValue("localite", null);
        setValue("cp", "");
        return;
      }
      const token = getAuthToken();
      try {
        const res = await fetch("http://localhost:3000/api/villes", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const filteredData = data.filter(
          (item) =>
            item.delegation === watchVille.id && item.governorate === watchGouvernorat.id
        );
        console.log("Filtered localites for", watchVille.id, watchGouvernorat.id, ":", filteredData);
        setLocaliteFullData(filteredData);
        const options = filteredData.map((item) => ({
          id: item.localite,
          name: item.localite,
          cp: item.cp,
        }));
        setLocaliteOptions(options);
        setValue("localite", null);
        setValue("cp", "");
      } catch (err) {
        console.error("Erreur chargement localités:", err);
        toast.error("Erreur chargement localités");
        setLocaliteFullData([]);
      }
    }
    fetchLocalites();
  }, [watchVille, watchGouvernorat, setValue]);

  // Mettre à jour le code postal selon la localité sélectionnée
  useEffect(() => {
    if (!watchLocalite) {
      setValue("cp", "");
      setValue("latitude", null);
      setValue("longitude", null);
      return;
    }
    const fullLocaliteData = localiteFullData.find(
      (item) => item.localite === watchLocalite.name || item.localite === watchLocalite.id
    );
    if (fullLocaliteData) {
      setValue("cp", fullLocaliteData.cp || "");
      if (fullLocaliteData.latitude && fullLocaliteData.longitude) {
        setValue("latitude", parseFloat(fullLocaliteData.latitude));
        setValue("longitude", parseFloat(fullLocaliteData.longitude));
      } else {
        setValue("latitude", null);
        setValue("longitude", null);
      }
    }
  }, [watchLocalite, localiteFullData, setValue]);

  // Validation téléphone
  const validatePhoneNumber = (value) => {
    if (!value) return "Le téléphone est requis";
    const cleaned = value.replace(/\D/g, '');
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

  // Remplacez la partie de construction du formData dans onSubmit par ceci :

  const onSubmit = async (data) => {
    setLoading(true);
    const token = getAuthToken();
    const decoded = decodeToken(token);
    if (!token || !decoded?.relatedId) {
      toast.error("Veuillez vous connecter.");
      setLoading(false);
      return;
    }

    // Debug : Voir les données brutes du formulaire
    console.log("🔍 RAW FORM DATA:", data);
    console.log("🔍 Gouvernorat object:", data.gouvernorat);
    console.log("🔍 Ville object:", data.ville);
    console.log("🔍 Localite object:", data.localite);

    if (!data.gouvernorat || !data.ville || !data.localite || !data.cp || !data.adresse) {
      toast.error("Veuillez compléter tous les champs d'adresse.");
      setLoading(false);
      return;
    }
    try {
      // Construction explicite avec logs
      const gouvernoratValue = data.gouvernorat?.name || data.gouvernorat?.id || data.gouvernorat;
      const delegationValue = data.ville?.name || data.ville?.id || data.ville;
      const villeValue = data.localite?.name || data.localite?.id || data.localite;

      const formData = {
        nom: data.nom,
        tel: data.tel,
        tel2: data.tel2,
        gouvernerat: gouvernoratValue,  
        delegation: delegationValue,
        ville: villeValue,
        localite: data.localite?.name || data.localite?.id || data.localite,
        cp: data.cp,
        adresse: data.adresse,
        latitude: data.latitude,
        longitude: data.longitude,
        designation: data.designation,
        prix: data.prix,
        nb_article: data.nb_article,
        nb_colis: data.nb_colis,
        mode: data.mode?.id,
        fragile: data.fragile,
        ouvrir: data.ouvrir === "Oui" ? 1 : 0,
        echange: data.echange,
        designation_echange: data.echange === "0" ? "" : data.designation_echange,
        nb_echange: data.echange === "0" ? "" : data.nb_echange,
        commentaire: data.commentaire,
        etat: 0,
        agence: idAgence,
        id_frs: decoded.relatedId,
        frs: expediteurName,
        date_add: new Date().toISOString().split("T")[0],
        paye: 0,
        msg: data.commentaire || null,
        imprime: 0
      };

    

      const res = await fetch("http://localhost:3000/api/commandes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const responseData = await res.json();

      if (!res.ok) throw new Error(`Erreur ${res.status}: ${JSON.stringify(responseData)}`);

      toast.success("Colis ajouté avec succès !", { duration: 5000 });
      setTimeout(() => reset(), 1000);

    } catch (err) {
      console.error("Erreur soumission:", err);
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Ajouter un nouveau colis">
      <div className="w-full p-6 bg-white rounded-xl shadow-md">
        <h5 className="text-lg font-semibold text-gray-800 mb-1">Nouveau pickup</h5>
        <p className="text-sm text-gray-500 mb-6">Veuillez remplir les informations du colis</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* Informations client */}
          <section className="border-b border-gray-200 pb-6">
            <h6 className="text-base font-semibold text-gray-800 mb-4">Informations client</h6>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Input
                  placeholder="Nom complet"
                  label="Nom complet"
                  aria-label="Nom complet du client"
                  {...register("nom", { required: "Le nom est requis" })}
                  error={errors.nom?.message}
                />
              </div>
              <div>
                <Input
                  placeholder="Téléphone"
                  label="Téléphone"
                  aria-label="Numéro de téléphone"
                  {...register("tel", { validate: validatePhoneNumber })}
                  error={errors.tel?.message}
                />
              </div>
              <div>
                <Input
                  placeholder="Téléphone 2"
                  label="Téléphone 2"
                  aria-label="Numéro de téléphone secondaire"
                  {...register("tel2")}
                  error={errors.tel2?.message}
                />
              </div>
            </div>
          </section>

          {/* Adresse de livraison */}
          <section className="border-b border-gray-200 pb-6">
            <h6 className="text-base font-semibold text-gray-800 mb-4">Adresse de livraison</h6>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="sm:col-span-4">
                <Input
                  placeholder="Adresse complète"
                  label="Adresse"
                  aria-label="Adresse de livraison"
                  {...register("adresse", { required: "L'adresse est requise" })}
                  error={errors.adresse?.message}
                />
              </div>
              <div>
                <Controller
                  control={control}
                  name="gouvernorat"
                  rules={{ required: "Le gouvernorat est requis" }}
                  render={({ field }) => (
                    <Listbox
                      data={gouvernoratOptions}
                      {...field}
                      placeholder="Sélectionner un gouvernorat"
                      label="Gouvernorat"
                      displayField="name"
                      valueField="id"
                      error={errors.gouvernorat?.message}
                      onChange={(val) => field.onChange(val)}
                    />
                  )}
                />
              </div>
              <div>
                <Controller
                  control={control}
                  name="ville"
                  rules={{ required: "La délégation est requise" }}
                  render={({ field }) => (
                    <Listbox
                      data={villeOptions}
                      {...field}
                      placeholder="Sélectionner une délégation"
                      label="Délégation"
                      displayField="name"
                      valueField="id"
                      error={errors.ville?.message}
                      onChange={(val) => field.onChange(val)}
                      disabled={villeOptions.length === 0}
                    />
                  )}
                />
              </div>
              <div>
                <Controller
                  control={control}
                  name="localite"
                  rules={{ required: "La localité est requise" }}
                  render={({ field }) => (
                    <Listbox
                      data={localiteOptions}
                      {...field}
                      placeholder="Sélectionner une localité"
                      label="Localité"
                      displayField="name"
                      valueField="id"
                      error={errors.localite?.message}
                      onChange={(val) => field.onChange(val)}
                      disabled={localiteOptions.length === 0}
                    />
                  )}
                />
              </div>
              <div>
                <Input
                  placeholder="Code postal"
                  label="Code postal"
                  aria-label="Code postal"
                  {...register("cp", {
                    required: "Le code postal est requis",
                    pattern: { value: /^\d{4}$/, message: "Doit être 4 chiffres" }
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
                  placeholder="Désignation"
                  label="Désignation"
                  aria-label="Désignation du colis"
                  {...register("designation", { required: "La désignation est requise" })}
                  error={errors.designation?.message}
                />
              </div>
              <div>
                <Input
                  placeholder="Prix (DT)"
                  label="Prix en DT"
                  type="number"
                  step="0.001"
                  aria-label="Prix du colis"
                  {...register("prix", { required: "Le prix est requis", valueAsNumber: true })}
                  error={errors.prix?.message}
                  onWheel={(e) => e.target.blur()}
                />
              </div>
              <div>
                <Input
                  placeholder="Nombre d'article"
                  label="Nombre d'article"
                  type="number"
                  aria-label="Nombre d'articles"
                  {...register("nb_article", { required: true, valueAsNumber: true })}
                  error={errors.nb_article?.message}
                />
              </div>
              <div>
                <Input
                  placeholder="Nombre de colis"
                  label="Nombre de colis"
                  type="number"
                  aria-label="Nombre de colis"
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
                control={control}
                name="mode"
                rules={{ required: "Le mode de paiement est requis" }}
                render={({ field }) => (
                  <Listbox
                    data={modeOptions}
                    {...field}
                    placeholder="Sélectionner un mode de paiement"
                    label="Mode de paiement"
                    displayField="name"
                    valueField="id"
                    error={errors.mode?.message}
                    onChange={(val) => field.onChange(val)}
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
                    <label key={val} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value={val === "Oui" ? "1" : "0"}
                        {...register("fragile")}
                        className="mr-2"
                        aria-label={`Fragile: ${val}`}
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
                    <label key={val} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value={val}
                        {...register("ouvrir")}
                        className="mr-2"
                        aria-label={`Ouvrir avant paiement: ${val}`}
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
                    <label key={val} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        {...register("echange")}
                        value={val === "Oui" ? "1" : "0"}
                        className="mr-2"
                        aria-label={`Échange: ${val}`}
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {watchEchange === "1" && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Input
                    placeholder="Désignation des articles à échanger"
                    label="Désignation des articles à échanger"
                    aria-label="Désignation des articles à échanger"
                    {...register("designation_echange", {
                      required: watchEchange === "1" ? "Ce champ est requis" : false,
                    })}
                    error={errors.designation_echange?.message}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Nombre d'articles à échanger"
                    label="Nombre d'articles à échanger"
                    type="number"
                    aria-label="Nombre d'articles à échanger"
                    {...register("nb_echange", {
                      required: watchEchange === "1" ? "Ce champ est requis" : false,
                      valueAsNumber: true,
                    })}
                    error={errors.nb_echange?.message}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Commentaire */}
          <section>
            <h6 className="text-base font-semibold text-gray-800 mb-4">Commentaire</h6>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("commentaire")}
              placeholder="Commentaires supplémentaires"
              aria-label="Commentaires supplémentaires"
            />
          </section>

          {/* Boutons */}
          <div className="mt-8 flex justify-end space-x-3">
            <Button
              type="button"
              className="min-w-[7rem]"
              onClick={() => window.history.back()}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="min-w-[7rem]"
              color="primary"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
}