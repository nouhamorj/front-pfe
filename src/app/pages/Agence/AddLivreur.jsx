// AjouterLivreurAgence.jsx
import { useState, useEffect } from "react";
import { useForm} from "react-hook-form";
import { Button, Input } from "components/ui";
import { toast } from "sonner";
import { Page } from "components/shared/Page";
import { useNavigate } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";

export default function AjouterLivreurAgence() {
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nom: "",
      tel: "",
      tel2: "",
      matricule: "",
      cin: "",
      secteur: "",
      salaire: "",
      prestation: "",
      salarier: 1,
      id_agence: null,
      login: "",
      email: "",
      pwd: "",
      confirmPwd: "",
      affiche: 1,
    },
  });

  const salarier = Number(watch("salarier"));
  const pwd = watch("pwd");

  // Charger l'agence du chef connecté
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
        // Pré-remplir et verrouiller l'agence
        setValue("id_agence", { id: agence.id, name: agence.libelle });
      } catch (err) {
        toast.error(err.message);
        console.error(err);
      }
    };

    if (user?.relatedIds?.id) {
      fetchAgence();
    }
  }, [user, setValue]);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) throw new Error("Token d'authentification manquant");

      const payload = {
        ...formData,
        id_agence: formData.id_agence?.id || null,
        affiche: 1,
        salarier: parseInt(formData.salarier),
      };

      // Champs conditionnels
      if (payload.salarier === 1) {
        delete payload.prestation;
      } else {
        delete payload.salaire;
      }
      delete payload.confirmPwd;

      const response = await fetch("http://localhost:3000/api/livreurs/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.message?.includes("Duplicate entry") && result.message.includes("for key 'login'")) {
          setError("login", {
            type: "manual",
            message: "Ce login est déjà utilisé, veuillez en choisir un autre.",
          });
          return;
        }
        throw new Error(result.message || "Erreur lors de la création du livreur");
      }

      toast.success("Livreur ajouté avec succès !");
      navigate("/agence/liste-livreurs");
    } catch (err) {
      toast.error(err.message || "Échec de l'ajout du livreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Ajout livreur">
      <div className="w-full max-w-4xl 2xl:max-w-6xl p-6 bg-white dark:bg-dark-800 rounded-xl shadow-md">
        <h5 className="text-lg font-semibold text-gray-800 dark:text-dark-50 mb-1">
          Ajouter un nouveau livreur
        </h5>
        <p className="text-sm text-gray-500 dark:text-dark-200 mb-6">
          Entrez les informations du nouveau livreur
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
                  label="Nom"
                  placeholder="Nom complet"
                  className="rounded-xl"
                  {...register("nom", { required: "Champ requis" })}
                  error={errors.nom?.message}
                />
              </div>
              <div>
                <Input
                  label="Téléphone"
                  placeholder="Téléphone"
                  className="rounded-xl"
                  {...register("tel", { required: "Champ requis" })}
                  error={errors.tel?.message}
                />
              </div>
              <div>
                <Input
                  label="Téléphone secondaire"
                  placeholder="Téléphone 2"
                  className="rounded-xl"
                  {...register("tel2")}
                />
              </div>
              <div>
                <Input
                  label="Matricule"
                  placeholder="Matricule"
                  className="rounded-xl"
                  {...register("matricule", { required: "Champ requis" })}
                  error={errors.matricule?.message}
                />
              </div>
              <div>
                <Input
                  label="CIN"
                  placeholder="Carte d'identité"
                  className="rounded-xl"
                  {...register("cin", { required: "Champ requis" })}
                  error={errors.cin?.message}
                />
              </div>
              <div>
                <Input
                  label="Secteur"
                  placeholder="Secteur"
                  className="rounded-xl"
                  {...register("secteur", { required: "Champ requis" })}
                  error={errors.secteur?.message}
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
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-200">
                  Type de contrat
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value={1}
                      className="mr-2"
                      {...register("salarier")}
                    />
                    Salarié
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value={0}
                      className="mr-2"
                      {...register("salarier")}
                    />
                    Prestataire
                  </label>
                </div>
              </div>
              {salarier === 1 && (
                <div>
                  <Input
                    label="Salaire (DT)"
                    placeholder="Montant du salaire"
                    type="number"
                    step="0.01"
                    className="rounded-xl"
                    {...register("salaire", {
                      required: "Salaire requis",
                      min: { value: 0, message: "Doit être positif" },
                    })}
                    error={errors.salaire?.message}
                  />
                </div>
              )}
              {salarier === 0 && (
                <div>
                  <Input
                    label="Prestation (DT)"
                    placeholder="Montant de la prestation"
                    type="number"
                    step="0.01"
                    className="rounded-xl"
                    {...register("prestation", {
                      required: "Prestation requise",
                      min: { value: 0, message: "Doit être positif" },
                    })}
                    error={errors.prestation?.message}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Authentification */}
          <section className="border-b border-gray-200 dark:border-dark-300 pb-6">
            <h6 className="text-base font-semibold text-gray-800 dark:text-dark-50 mb-4">
              Identifiants de connexion
            </h6>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Input
                  label="Login"
                  placeholder="Identifiant"
                  className="rounded-xl"
                  {...register("login", { required: "Login requis" })}
                  error={errors.login?.message}
                />
              </div>
              <div className="relative">
                <Input
                  label="Mot de passe"
                  type={showPwd ? "text" : "password"}
                  placeholder="Mot de passe"
                  className="rounded-xl"
                  {...register("pwd", {
                    required: "Mot de passe requis",
                    minLength: { value: 6, message: "Au moins 6 caractères" },
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
                  label="Confirmer le mot de passe"
                  type={showConfirmPwd ? "text" : "password"}
                  placeholder="Confirmation"
                  className="rounded-xl"
                  {...register("confirmPwd", {
                    required: "Confirmation requise",
                    validate: (value) => value === pwd || "Les mots de passe ne correspondent pas",
                  })}
                  error={errors.confirmPwd?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute top-9 right-3 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  aria-label={showConfirmPwd ? "Masquer la confirmation" : "Afficher la confirmation"}
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
              <div>
                <Input
                  label="Email"
                  placeholder="Adresse email"
                  type="email"
                  className="rounded-xl"
                  {...register("email", {
                    required: "Email requis",
                    pattern: {
                      value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                      message: "Email invalide",
                    },
                  })}
                  error={errors.email?.message}
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => window.history.back()}
              disabled={loading}
              className="min-w-[7rem]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={loading}
              className="min-w-[7rem]"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
}