import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input } from "components/ui";
import { toast } from "sonner";
import { Page } from "components/shared/Page";
import { useNavigate } from "react-router";

export default function AddAgence() {
  const [loading, setLoading] = useState(false);
  const [villeOptions, setVilleOptions] = useState([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      libelle: "",
      prenomResp: "",
      nomResp: "",
      telResp: "",
      tel_agence: "",
      cinResp: "",
      login: "",
      email: "",
      pwd: "",
      confirmPwd: "",
      ville: [],
    },
  });

  // Pour afficher / cacher les mots de passe
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Watch the password field for confirmation validation
  const pwd = watch("pwd");

  // Fetch governorates
  useEffect(() => {
    const fetchVilles = async () => {
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) throw new Error("Token d'authentification manquant");
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

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) throw new Error("Token d'authentification manquant");

      const formData = { ...data };

      // Ensure ville is an array of selected governorate names
      formData.ville = data.ville || [];

      // Supprimer confirmPwd du formData car il n'est pas requis par l'API
      delete formData.confirmPwd;

      const response = await fetch("http://localhost:3000/api/agences/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Gestion spécifique du login déjà utilisé
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

        throw new Error(errorData.message || "Erreur lors de la création de l'agence");
      }

      toast.success("Agence créée avec succès !");
      navigate("/admin/liste-agences");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Ajout agence">
      <div className="w-full max-w-4xl 2xl:max-w-6xl p-6 bg-white dark:bg-dark-800 rounded-xl shadow-md">
        <h5 className="text-lg font-semibold text-gray-800 dark:text-dark-50 mb-1">
          Ajouter une nouvelle Agence
        </h5>
        <p className="text-sm text-gray-500 dark:text-dark-200 mb-6">
          Entrez les informations de la nouvelle agence
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* Informations de l'agence */}
          <section className="border-b border-gray-200 dark:border-dark-300 pb-6">
            <h6 className="text-base font-semibold text-gray-800 dark:text-dark-50 mb-4">
              Informations Agence
            </h6>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Input
                  placeholder="Libellé de l'agence"
                  label="Libellé"
                  className="rounded-xl"
                  {...register("libelle", { required: "Le libellé est requis" })}
                  error={errors.libelle?.message}
                />
              </div>
              <div>
                <Input
                  placeholder="Prénom du responsable"
                  label="Prénom du responsable"
                  className="rounded-xl"
                  {...register("prenomResp", { required: "Le prénom du responsable est requis" })}
                  error={errors.prenomResp?.message}
                />
              </div>
              <div>
                <Input
                  placeholder="Nom du responsable"
                  label="Nom du responsable"
                  className="rounded-xl"
                  {...register("nomResp", { required: "Le nom du responsable est requis" })}
                  error={errors.nomResp?.message}
                />
              </div>
              <div>
                <Input
                  placeholder="Numéro de téléphone du responsable"
                  label="Téléphone du responsable"
                  type="tel"
                  className="rounded-xl"
                  {...register("telResp", {
                    required: "Le numéro de téléphone du responsable est requis",
                    pattern: {
                      value: /^[0-9]{8}$/,
                      message: "Le numéro doit contenir exactement 8 chiffres",
                    },
                  })}
                  error={errors.telResp?.message}
                />
              </div>
              <div>
                <Input
                  placeholder="Numéro de téléphone de l'agence"
                  label="Téléphone de l'agence"
                  type="tel"
                  className="rounded-xl"
                  {...register("tel_agence", {
                    required: "Le numéro de téléphone de l'agence est requis",
                    pattern: {
                      value: /^[0-9]{8}$/,
                      message: "Le numéro doit contenir exactement 8 chiffres",
                    },
                  })}
                  error={errors.tel_agence?.message}
                />
              </div>
              <div>
                <Input
                  placeholder="CIN du responsable"
                  label="CIN du responsable"
                  className="rounded-xl"
                  {...register("cinResp", {
                    required: "Le CIN du responsable est requis",
                    pattern: {
                      value: /^[0-9]{8}$/,
                      message: "Le CIN doit contenir exactement 8 chiffres",
                    },
                  })}
                  error={errors.cinResp?.message}
                />
              </div>
              <div>
                <Input
                  placeholder="Email"
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
            </div>
          </section>

          {/* Contact et localisation */}
          <section className="border-b border-gray-200 dark:border-dark-300 pb-6">
            <h6 className="text-base font-semibold text-gray-800 dark:text-dark-50 mb-4">Localisation</h6>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-200">
                  Gouvernorats
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {villeOptions.map((ville) => (
                    <label key={ville.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value={ville.name}
                        className="mr-2"
                        {...register("ville", {
                          required: "Au moins un gouvernorat est requis",
                        })}
                      />
                      {ville.name}
                    </label>
                  ))}
                </div>
                {errors.ville && (
                  <p className="mt-1 text-sm text-red-600">{errors.ville.message}</p>
                )}
              </div>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.959 9.959 0 012.335-6.251M19.788 19.788a10.048 10.048 0 01-3.788 1.212 9.955 9.955 0 01-6.21-2.337M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.959 9.959 0 012.335-6.251M19.788 19.788a10.048 10.048 0 01-3.788 1.212 9.955 9.955 0 01-6.21-2.337M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Boutons */}
          <div className="mt-8 flex justify-endbatt space-x-3">
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