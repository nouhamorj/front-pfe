import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { toast } from "sonner";
import { Page } from "components/shared/Page";
import { useNavigate } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";

export default function AddExp() {
  const [loading, setLoading] = useState(false);
  const [villeOptions, setVilleOptions] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuthContext();

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
    setError,
    control,
    formState: { errors },
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
      pwd: "",
      confirmPwd: "",
      tva: "",
      rib: "",
      banque: "",
      nom_banque: "",
      mode: null,
      etat: 1,
      exo: 2,
      type_client: 2,
    },
  });

  // Pour afficher / cacher les mots de passe
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const typeClient = watch("type_client");
  const pwd = watch("pwd");
  const mode = watch("mode");

  // Synchronise exo avec type_client
  useEffect(() => {
    setValue("exo", typeClient);
  }, [typeClient, setValue]);

  // Charger les villes
  useEffect(() => {
    const fetchVilles = async () => {
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) throw new Error(`Token d'authentification manquant`);
        const response = await fetch("http://localhost:3000/api/villes", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Erreur lors de la récupération des villes");
        const data = await response.json();
        const governorates = [...new Set(data.map((ville) => ville.governorate))];
        const formattedVilles = governorates.map((governorate, index) => ({
          id: index + 1,
          name: governorate,
        }));
        setVilleOptions(formattedVilles);
      } catch (err) {
        toast.error(err.message);
      }
    };

    fetchVilles();
  }, []);

  useEffect(() => {
    const fetchAgence = async () => {
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) throw new Error("Token d'authentification manquant");
        if (!user?.relatedIds?.id) throw new Error("Agence non trouvée dans le profil utilisateur");

        const response = await fetch(`http://localhost:3000/api/agences/${user.relatedIds.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération de l'agence");
        const agence = await response.json();

        setValue("id_agence", { id: agence.id, name: agence.libelle });
      } catch (err) {
        toast.error(err.message);
        console.error(err);
      }
    };

    if (user?.relatedIds?.id) {
      fetchAgence();
    }
  }, [user]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) throw new Error("Token d'authentification manquant");

      const formData = { ...data };

      formData.mode = formData.mode?.id || null;
      formData.id_agence = formData.id_agence?.id || null; 
      formData.ville = formData.ville?.name || null;

      const response = await fetch("http://localhost:3000/api/expediteurs/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (
          errorData.message &&
          errorData.message.includes("Duplicate entry") &&
          errorData.message.includes("for key 'login'")
        ) {
          setError("login", {
            type: "manual",
            message: "Ce login est déjà utilisé, veuillez en choisir un autre.",
          });
          return;
        }
        throw new Error(errorData.message || "Erreur lors de la création de l’expéditeur");
      }

      toast.success("Expéditeur créé avec succès !");
      navigate("/agence/liste-expediteurs");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Ajout expéditeur">
      <div className="w-full max-w-4xl 2xl:max-w-6xl p-6 bg-white dark:bg-dark-800 rounded-xl shadow-md">
        <h5 className="text-lg font-semibold text-gray-800 dark:text-dark-50 mb-1">
          Ajouter un nouveau Expéditeur
        </h5>
        <p className="text-sm text-gray-500 dark:text-dark-200 mb-6">
          Entrez les informations du nouveau expéditeur
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
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
                      value={2}
                      className="mr-2"
                      {...register("type_client")}
                    />
                    Particulier
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value={1}
                      className="mr-2"
                      {...register("type_client")}
                    />
                    Société
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Contact et localisation */}
          <section className="border-b border-gray-200 dark:border-dark-300 pb-6">
            <h6 className="text-base font-semibold text-gray-800 dark:text-dark-50 mb-4">
              Contact et localisation
            </h6>
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
                <Input
                  label="Agence"
                  value={watch("id_agence")?.name || "Chargement..."}
                  disabled
                  className="rounded-xl bg-gray-100 dark:bg-dark-700 cursor-not-allowed text-gray-700 dark:text-gray-300"
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
                      value={1}
                      className="mr-2"
                      {...register("etat")}
                    />
                    Actif
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value={0}
                      className="mr-2"
                      {...register("etat")}
                    />
                    Inactif
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Tarification */}
          <section className="border-b border-gray-200 dark:border-dark-300 pb-6">
            <h6 className="text-base font-semibold text-gray-800 dark:text-dark-50 mb-4">
              Tarification
            </h6>
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
                  label="Prix de retour"
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
              {typeClient == 1 && (
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
            <h6 className="text-base font-semibold text-gray-800 dark:text-dark-50 mb-4">
              Authentification
            </h6>
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
              <div className="relative">
                <Input
                  placeholder="Nouveau Mot de passe"
                  label="Nouveau Mot de passe"
                  type={showPwd ? "text" : "password"}
                  className="rounded-xl"
                  {...register("pwd", {
                    required: "Le mot de passe est requis",
                    minLength: { value: 6, message: "Le mot de passe doit contenir au moins 6 caractères" },
                  })}
                  error={errors.pwd?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute top-9 right-3 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPwd ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.959 9.959 0 012.335-6.251M19.788 19.788a10.048 10.048 0 01-3.788 1.212 9.955 9.955 0 01-6.21-2.337M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="relative">
                <Input
                  placeholder="Confirmer le mot de passe"
                  label="Confirmer le mot de passe"
                  type={showConfirmPwd ? "text" : "password"}
                  className="rounded-xl"
                  {...register("confirmPwd", {
                    required: "La confirmation du mot de passe est requise",
                    validate: (value) => value === pwd || "Les mots de passe ne correspondent pas",
                  })}
                  error={errors.confirmPwd?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute top-9 right-3 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  aria-label={showConfirmPwd ? "Masquer la confirmation du mot de passe" : "Afficher la confirmation du mot de passe"}
                >
                  {showConfirmPwd ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.959 9.959 0 012.335-6.251M19.788 19.788a10.048 10.048 0 01-3.788 1.212 9.955 9.955 0 01-6.21-2.337M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Mode de paiement */}
          <section>
            <h6 className="text-base font-semibold text-gray-800 dark:text-dark-50 mb-4">
              Mode de paiement
            </h6>
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
                  <div>
                    <Input
                      placeholder="Nom de la banque"
                      label="Nom de la banque"
                      className="rounded-xl"
                      {...register("nom_banque", { required: "Le nom de la banque est requis" })}
                      error={errors.nom_banque?.message}
                    />
                  </div>
                </>
              )}
            </div>
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
            <Button type="submit" className="min-w-[7rem]" color="primary" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
}