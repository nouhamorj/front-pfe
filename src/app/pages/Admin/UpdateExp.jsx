import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useParams, useNavigate } from "react-router";
import { Button, Input } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { toast } from "sonner";
import { Page } from "components/shared/Page";

export default function EditExp() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agenceOptions, setAgenceOptions] = useState([]);
  const [villeOptions, setVilleOptions] = useState([]);

  const modeOptions = [
    { id: "1", name: "Espèces" },
    { id: "2", name: "Chèques" },
    { id: "3", name: "Virement" },
    { id: "4", name: "Carte bancaire" },
  ];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
    trigger,
    reset,
  } = useForm({
    defaultValues: {
      nom: "",
      nom_page: "",
      id_agence: null,
      email: "",
      tel: "",
      prix_liv: "",
      prix_rtn: "",
      adresse: "",
      ville: null,
      login: "",
      tva: "",
      rib: "",
      banque: "",
      mode: null,
      etat: "1",
      exo: "2",
      type_client: "2",
    },
  });

  const mode = watch("mode");
  const typeClient = watch("type_client");

  // Débogage des valeurs du formulaire
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "etat" || name === "type_client") {
        console.log(`Valeur actuelle de ${name} :`, value[name]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    const fetchAll = async () => {
      await fetchAgences();
      await fetchVilles();
      await fetchExpediteur();
    };
    fetchAll();
  }, []);

  // Fonctions de mapping pour la conversion des valeurs
  const mapExoToTypeClient = (exo) => {
    switch (String(exo)) {
      case "0": return "2"; // Particulier
      case "1": return "1"; // Société
      default: return "2"; // Valeur par défaut : Particulier
    }
  };

  const mapTypeClientToExo = (typeClient) => {
    switch (typeClient) {
      case "2": return "0"; // Particulier
      case "1": return "1"; // Société
      default: return "0"; // Valeur par défaut
    }
  };

  const fetchExpediteur = async () => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      // Requête à l'API expediteurs/:id
      const expRes = await fetch(`http://localhost:3000/api/expediteurs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!expRes.ok) throw new Error("Erreur de chargement de l'expéditeur");
      const expData = await expRes.json();
      console.log("Données expéditeur :", JSON.stringify(expData, null, 2));

      // Requête à l'API users/:id
      const userRes = await fetch(`http://localhost:3000/api/users/${expData.user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!userRes.ok) throw new Error("Erreur de chargement des données utilisateur");
      const userData = await userRes.json();
      console.log("Données utilisateur :", JSON.stringify(userData, null, 2));

      // Vérifiez les valeurs
      console.log("etat :", expData.etat, typeof expData.etat);
      console.log("type_client (exo) :", expData.exo, typeof expData.exo);
      console.log("mode :", expData.mode, typeof expData.mode);
      console.log("email :", userData.user?.email);
      console.log("login :", userData.user?.login);

      setValue("nom", expData.nom || "");
      setValue("nom_page", expData.nom_page || "");
      setValue("email", userData.user?.email || "");
      setValue("tel", expData.tel || "");
      setValue("prix_liv", expData.prix_liv || "");
      setValue("prix_rtn", expData.prix_rtn || "");
      setValue("adresse", expData.adresse || "");
      setValue("login", userData.user?.login || "");
      setValue("tva", expData.tva || "");
      setValue("rib", expData.rib || "");
      setValue("banque", expData.banque || "");
      setValue("etat", String(expData.etat)); // Convertir en chaîne
      setValue("exo", String(expData.exo));
      
      // Utiliser la fonction de mapping pour convertir exo vers type_client
      setValue("type_client", mapExoToTypeClient(expData.exo));
      
      setValue("id_agence", {
        id: expData.id_agence,
        name: expData.agence_libelle || "",
      });
      setValue("ville", { id: 1, name: expData.ville || "" });
      
      const selectedMode = modeOptions.find((m) => m.id === String(expData.mode));
      if (!selectedMode) {
        console.warn("Mode non trouvé :", expData.mode);
        setValue("mode", null);
      } else {
        setValue("mode", selectedMode);
        console.log("Mode sélectionné :", selectedMode);
      }

      // Forcer la revalidation des champs radio
      await trigger(["etat", "type_client"]);

      // Alternative : reset partiel pour garantir la mise à jour
      reset(
        {
          etat: String(expData.etat),
          type_client: mapExoToTypeClient(expData.exo),
        },
        { keepValues: true }
      );
    } catch (error) {
      console.error("Erreur dans fetchExpediteur :", error);
      toast.error(error.message);
    }
  };

  const fetchAgences = async () => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const res = await fetch("http://localhost:3000/api/agences", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAgenceOptions(data.map((a) => ({ id: a.id, name: a.libelle })));
    } catch {
      toast.error("Erreur chargement agences");
    }
  };

  const fetchVilles = async () => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const res = await fetch("http://localhost:3000/api/villes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const governorates = [...new Set(data.map((v) => v.governorate))];
      setVilleOptions(governorates.map((g, i) => ({ id: i + 1, name: g })));
    } catch {
      toast.error("Erreur chargement villes");
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const payload = {
        ...data,
        id_agence: data.id_agence?.id,
        mode: data.mode?.id,
        ville: data.ville?.name,
        // Utiliser la fonction de mapping pour convertir type_client vers exo
        exo: mapTypeClientToExo(data.type_client),
      };
      
      console.log("Payload envoyé :", JSON.stringify(payload, null, 2));
      
      const res = await fetch(`http://localhost:3000/api/expediteurs/update/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      toast.success("Expéditeur mis à jour avec succès !");
      navigate("/admin/liste-expediteurs");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Modifier un expéditeur">
      <div className="w-full max-w-4xl 2xl:max-w-6xl p-6 bg-white dark:bg-dark-800 rounded-xl shadow-md">
        <h5 className="text-lg font-semibold text-gray-800 dark:text-dark-50 mb-1">Modifier un Expéditeur</h5>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Informations personnelles */}
          <section className="border-b border-gray-200 dark:border-dark-300 pb-6">
            <h6 className="text-base font-semibold text-gray-800 dark:text-dark-50 mb-4">
              Informations personnelles
            </h6>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Input
                  placeholder="Nom & prénom"
                  label="Nom & prénom"
                  className="rounded-xl"
                  {...register("nom", { required: "Le nom est requis" })}
                  error={errors.nom?.message}
                />
              </div>
              <div>
                <Input
                  placeholder="Nom de la page"
                  label="Nom de la page"
                  className="rounded-xl"
                  {...register("nom_page", { required: "Le nom de la page est requis" })}
                  error={errors.nom_page?.message}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-200">
                  Type de client
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="2"
                      className="mr-2"
                      {...register("type_client")}
                    /> Particulier
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="1"
                      className="mr-2"
                      {...register("type_client")}
                    /> Société
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Contact et localisation */}
          <section className="border-b border-gray-200 dark:border-dark-300 pb-6">
            <h6 className="text-base font-semibold text-gray-800 dark:text-dark-50 mb-4">Contact et localisation</h6>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Input
                  placeholder="Entrer Email"
                  label="Email"
                  type="email"
                  className="rounded-xl"
                  {...register("email", {
                    required: "L'email est requis",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Format d'email invalide",
                    },
                  })}
                  error={errors.email?.message}
                />
              </div>
              <div>
                <Input
                  placeholder="Numéro de téléphone"
                  label="Numéro de téléphone"
                  type="tel"
                  className="rounded-xl"
                  {...register("tel", {
                    required: "Le numéro de téléphone est requis",
                    pattern: {
                      value: /^[0-9]{8,}$/,
                      message: "Numéro de téléphone invalide",
                    },
                  })}
                  error={errors.tel?.message}
                />
              </div>
              <div>
                <Controller
                  control={control}
                  name="id_agence"
                  rules={{ required: "L'agence est requise" }}
                  render={({ field }) => (
                    <Listbox
                      data={agenceOptions}
                      {...field}
                      placeholder="Sélectionner une agence"
                      label="Agence"
                      displayField="name"
                      valueField="id"
                      error={errors.id_agence?.message}
                      onChange={(val) => field.onChange(val)}
                    />
                  )}
                />
              </div>
              <div>
                <Input
                  placeholder="Adresse"
                  label="Adresse"
                  className="rounded-xl"
                  {...register("adresse", { required: "L'adresse est requise" })}
                  error={errors.adresse?.message}
                />
              </div>
              <div>
                <Controller
                  control={control}
                  name="ville"
                  rules={{ required: "Le gouvernorat est requis" }}
                  render={({ field }) => (
                    <Listbox
                      data={villeOptions}
                      {...field}
                      placeholder="Sélectionner un gouvernorat"
                      label="Gouvernorat"
                      displayField="name"
                      valueField="name"
                      error={errors.ville?.message}
                      onChange={(val) => field.onChange(val)}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-200">
                  État
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="1"
                      className="mr-2"
                      {...register("etat")}
                    /> Actif
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="0"
                      className="mr-2"
                      {...register("etat")}
                    /> Inactif
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Tarification */}
          <section className="border-b border-gray-200 dark:border-dark-300 pb-6">
            <h6 className="text-base font-semibold text-gray-800 dark:text-dark-50 mb-4">Tarification</h6>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Input
                  placeholder="Prix de livraison"
                  label="Prix de livraison"
                  type="number"
                  step="0.01"
                  className="rounded-xl"
                  {...register("prix_liv", {
                    required: "Le prix de livraison est requis",
                    min: { value: 0, message: "Le prix doit être positif" },
                  })}
                  error={errors.prix_liv?.message}
                />
              </div>
              <div>
                <Input
                  placeholder="Prix retour"
                  label="Prix retour"
                  type="number"
                  step="0.01"
                  className="rounded-xl"
                  {...register("prix_rtn", {
                    required: "Le prix de retour est requis",
                    min: { value: 0, message: "Le prix doit être positif" },
                  })}
                  error={errors.prix_rtn?.message}
                />
              </div>
              {typeClient === "1" && (
                <div>
                  <Input
                    placeholder="TVA"
                    label="TVA"
                    className="rounded-xl"
                    {...register("tva", { required: "La TVA est requise" })}
                    error={errors.tva?.message}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Authentification */}
          <section className="border-b border-gray-200 dark:border-dark-300 pb-6">
            <h6 className="text-base font-semibold text-gray-800 dark:text-dark-50 mb-4">Authentification</h6>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Input
                  placeholder="Login"
                  label="Login"
                  className="rounded-xl"
                  {...register("login", { required: "Le login est requis" })}
                  error={errors.login?.message}
                />
              </div>
            </div>
          </section>

          {/* Mode de paiement */}
          <section>
            <h6 className="text-base font-semibold text-gray-800 dark:text-dark-50 mb-4">Mode de paiement</h6>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
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
              {(mode?.id === "2" || mode?.id === "3") && (
                <>
                  <div>
                    <Input
                      placeholder="RIB"
                      label="RIB"
                      className="rounded-xl"
                      {...register("rib", {
                        required: "Le RIB est requis",
                        pattern: {
                          value: /^[0-9]{20}$/,
                          message: "Le RIB doit contenir exactement 20 chiffres",
                        },
                      })}
                      error={errors.rib?.message}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Banque"
                      label="Banque"
                      className="rounded-xl"
                      {...register("banque", { required: "La banque est requise" })}
                      error={errors.banque?.message}
                    />
                  </div>
                  
                </>
              )}
            </div>
          </section>

          {/* Boutons */}
          <div className="mt-8 flex justify-end space-x-3">
            <Button type="button" onClick={() => navigate(-1)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" color="primary" disabled={loading}>
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
}