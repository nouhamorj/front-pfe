import { Page } from "components/shared/Page";
import { UserIcon, EnvelopeIcon, PhoneIcon, HomeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Button, Input } from "components/ui";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ProfileFournisseur() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [governorates, setGovernorates] = useState([]); 

  const { register, reset, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      nom: "",
      nomPage: "",
      tel: "",
      adresse: "",
      ville: "",
      email: "",
      login: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchNewPassword = watch("newPassword");

  // Récupérer le token et relatedId
  const getAuthToken = () => localStorage.getItem("authToken");

  const getRelatedId = () => {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.relatedId || null;
    } catch (error) {
      console.error("Token invalide", error);
      return null;
    }
  };

  // Charger le profil du fournisseur
  const fetchProfile = async () => {
    const token = getAuthToken();
    const relatedId = getRelatedId();

    if (!token || !relatedId) {
      toast.error("Session expirée ou données manquantes");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/expediteurs/profile/${relatedId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Échec du chargement du profil");

      const data = await res.json();
      setProfileData(data);

      // Pré-remplir le formulaire
      reset({
        nom: data.nom || "",
        nomPage: data.nom_page || "",
        tel: data.tel || "",
        adresse: data.adresse || "",
        ville: data.ville || "",
        email: data.email || "",
        login: data.login || "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Erreur chargement profil:", error);
      toast.error(error.message || "Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  };

  // Charger les gouvernorats uniques (avec authentification)
useEffect(() => {
  const fetchGovernorates = async () => {
    const token = getAuthToken();

    if (!token) {
      toast.error("Session expirée. Veuillez vous reconnecter.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/villes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur API villes:", errorText);
        throw new Error(`Échec du chargement des villes (${res.status})`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Format de réponse invalide pour les villes");
      }

      const uniqueGovernorates = [...new Set(data.map((v) => v.governorate))].sort();
      setGovernorates(uniqueGovernorates);
    } catch (error) {
      console.error("Erreur lors du chargement des gouvernorats :", error);
      toast.error("Impossible de charger la liste des villes. Vérifiez votre connexion.");
    }
  };

  fetchGovernorates();
}, []);

  // Soumettre la mise à jour
  const onSubmit = async (formData) => {
    const token = getAuthToken();
    const relatedId = getRelatedId();

    if (!token || !relatedId || !profileData) {
      toast.error("Session expirée ou données manquantes");
      return;
    }

    // Validation mot de passe
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        user_id: profileData.user_id,
        nom: formData.nom,
        nom_page: formData.nomPage,
        tel: formData.tel,
        adresse: formData.adresse,
        ville: formData.ville,
        email: formData.email,
        login: formData.login,
      };

      if (formData.newPassword && formData.newPassword.trim()) {
        payload.password = formData.newPassword;
      }

      const res = await fetch(`http://localhost:3000/api/expediteurs/update/${relatedId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Échec de la mise à jour");
      }

      toast.success("Profil mis à jour avec succès !");
      await fetchProfile(); // Recharger les données
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      toast.error(error.message || "Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  // Charger le profil après le chargement des gouvernorats
  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Page title="Profil Fournisseur">
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg text-gray-600">Chargement du profil...</p>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Profil Fournisseur">
      <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 py-6">
        {/* En-tête */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-dark-50">Mon Profil</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-200">
            Mettez à jour vos informations personnelles et professionnelles.
          </p>
        </div>

        {/* Formulaire */}
        <div className="overflow-hidden bg-white dark:bg-dark-900 rounded-xl shadow-md border border-gray-200 dark:border-dark-700">
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-6xl">
              <h5 className="text-lg font-medium text-gray-800 dark:text-dark-50">Informations du Fournisseur</h5>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-dark-200">
                Ces champs seront utilisés pour les livraisons et la facturation.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 [&_.prefix]:pointer-events-none">
                {/* Nom complet */}
                <Input
                  label="Nom complet"
                  placeholder="Salma Ben Ahmed"
                  className="rounded-xl"
                  prefix={<UserIcon className="size-4.5" />}
                  {...register("nom", { required: "Nom requis" })}
                  error={errors.nom?.message}
                />

                {/* Nom de la page/boutique */}
                <Input
                  label="Nom de la page / boutique"
                  placeholder="Qualité prix raisonnable"
                  className="rounded-xl"
                  prefix={<UserIcon className="size-4.5" />}
                  {...register("nomPage", { required: "Nom de page requis" })}
                  error={errors.nomPage?.message}
                />

                {/* Téléphone */}
                <Input
                  label="Téléphone"
                  placeholder="21 007 020"
                  type="tel"
                  className="rounded-xl"
                  prefix={<PhoneIcon className="size-4.5" />}
                  {...register("tel", { required: "Téléphone requis" })}
                  error={errors.tel?.message}
                />

                {/* Adresse */}
                <Input
                  label="Adresse"
                  placeholder="Rue Mohamed Ben Ali"
                  className="rounded-xl"
                  prefix={<HomeIcon className="size-4.5" />}
                  {...register("adresse", { required: "Adresse requise" })}
                  error={errors.adresse?.message}
                />

                {/* Ville - Dropdown */}
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
                    Ville / Gouvernorat
                  </label>
                  <div className="relative">
                    <select
                      {...register("ville", { required: "Ville requise" })}
                      className="w-full rounded-xl border border-gray-300 bg-white dark:bg-dark-800 dark:border-dark-600 px-3 py-2 pl-10 text-gray-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Sélectionnez un gouvernorat</option>
                      {governorates.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                    <HomeIcon className="absolute left-3 top-1/2 size-4.5 -translate-y-1/2 text-gray-500 dark:text-dark-300" />
                  </div>
                  {errors.ville && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ville.message}</p>
                  )}
                </div>

                {/* Email */}
                <Input
                  label="Email"
                  placeholder="qpr@gmail.com"
                  type="email"
                  className="rounded-xl"
                  prefix={<EnvelopeIcon className="size-4.5" />}
                  {...register("email", {
                    required: "Email requis",
                    pattern: { value: /^\S+@\S+\.\S+$/i, message: "Email invalide" }
                  })}
                  error={errors.email?.message}
                />

                {/* Login */}
                <Input
                  label="Login"
                  placeholder="qpr"
                  className="rounded-xl"
                  prefix={<UserIcon className="size-4.5" />}
                  {...register("login", { required: "Login requis" })}
                  error={errors.login?.message}
                />

                {/* Nouveau mot de passe */}
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  placeholder="Laisser vide pour conserver l'actuel"
                  className="rounded-xl"
                  prefix={<LockClosedIcon className="size-4.5" />}
                  {...register("newPassword", {
                    minLength: { value: 6, message: "Au moins 6 caractères" }
                  })}
                  error={errors.newPassword?.message}
                />

                {/* Confirmation mot de passe */}
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="Confirmez le mot de passe"
                  className="rounded-xl"
                  prefix={<LockClosedIcon className="size-4.5" />}
                  {...register("confirmPassword", {
                    validate: (value) => {
                      if (watchNewPassword && !value) return "Veuillez confirmer le mot de passe";
                      if (watchNewPassword && value !== watchNewPassword) return "Les mots de passe ne correspondent pas";
                      return true;
                    }
                  })}
                  error={errors.confirmPassword?.message}
                />
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <Button
                  type="button"
                  className="min-w-[7rem]"
                  onClick={fetchProfile}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="min-w-[7rem]"
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Page>
  );
}