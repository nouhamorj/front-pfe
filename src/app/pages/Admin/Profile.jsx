// src/app/pages/Profile/Profile.jsx

// Import Dependencies
import { Page } from "components/shared/Page";
import { EnvelopeIcon, UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Button, Input } from "components/ui";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const { register, reset, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      fullName: "",
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
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.relatedId || null;
    } catch (error) {
      return error;
    }
  };

  // Charger le profil
  const fetchProfile = async () => {
    const token = getAuthToken();
    const relatedId = getRelatedId();

    if (!token || !relatedId) {
      toast.error("Données utilisateur manquantes");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/admins/profile/${relatedId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Échec du chargement du profil");

      const profile = await res.json();

      // Stocker les données du profil pour les utiliser dans l'update
      setProfileData(profile);

      // Pré-remplir le formulaire
      const formData = {
        fullName: `${profile.prenom || ""} ${profile.nom || ""}`.trim(),
        email: profile.user?.email || "",
        login: profile.user?.login || "",
        newPassword: "",
        confirmPassword: "",
      };
      
      reset(formData);
    } catch (error) {
      console.error("Erreur chargement profil:", error);
      toast.error("Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  };

  // Soumettre la modification
  const onSubmit = async (data) => {
    const token = getAuthToken();
    const relatedId = getRelatedId();

    if (!token || !relatedId || !profileData) {
      toast.error("Session expirée ou données manquantes");
      return;
    }

    // Validation mot de passe
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setSubmitting(true);

    try {
      // Séparer le nom complet
      const nameParts = data.fullName.trim().split(" ");
      const prenom = nameParts.slice(0, -1).join(" ") || nameParts[0] || "";
      const nom = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

      const payload = {
        user_id: profileData.user.id, // ✅ Ajouter le user_id requis par l'API
        nom: nom,
        prenom: prenom,
        email: data.email,
        login: data.login,
      };

      // Ajouter mot de passe seulement s'il est saisi
      if (data.newPassword && data.newPassword.trim()) {
        payload.password = data.newPassword;
      }

      const res = await fetch(`http://localhost:3000/api/admins/update/${relatedId}`, {
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
      
      // Recharger les données du profil
      await fetchProfile();
      
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
      toast.error(error.message || "Impossible de mettre à jour le profil");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Page title="Profil utilisateur">
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg text-gray-600">Chargement du profil...</p>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Profil utilisateur">
      <div className="w-full max-w-6xl mx-auto px-(--margin-x) py-6">
        {/* En-tête */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-dark-50">Profil utilisateur</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-200">
            Gérez vos informations personnelles et préférences.
          </p>
        </div>

        {/* Section : Informations générales */}
        <div className="overflow-hidden bg-white dark:bg-dark-900 rounded-xl shadow-md border border-gray-200 dark:border-dark-700">
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-3xl 2xl:max-w-5xl">
              <h5 className="text-lg font-medium text-gray-800 dark:text-dark-50">Général</h5>
              <p className="mt-0.5 text-balance text-sm text-gray-500 dark:text-dark-200">
                Mettez à jour vos informations personnelles.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 [&_.prefix]:pointer-events-none">
                <Input
                  label="Nom & prénom"
                  placeholder="Nouha Morjene"
                  className="rounded-xl"
                  prefix={<UserIcon className="size-4.5" />}
                  {...register("fullName", { required: "Nom complet requis" })}
                  error={errors.fullName?.message}
                />
                <Input
                  label="Email"
                  placeholder="votre.email@exemple.com"
                  type="email"
                  className="rounded-xl"
                  prefix={<EnvelopeIcon className="size-4.5" />}
                  {...register("email", { 
                    required: "Email requis", 
                    pattern: { 
                      value: /^\S+@\S+\.\S+$/i, 
                      message: "Format email invalide" 
                    } 
                  })}
                  error={errors.email?.message}
                />
                <Input
                  label="Login"
                  placeholder="Login"
                  className="rounded-xxl"
                  prefix={<UserIcon className="size-4.5" />}
                  {...register("login", { required: "Login requis" })}
                  error={errors.login?.message}
                />

                <Input
                  label="Nouveau mot de passe"
                  placeholder="Laisser vide pour ne pas changer"
                  type="password"
                  className="rounded-xl"
                  prefix={<LockClosedIcon className="size-4.5" />}
                  {...register("newPassword", {
                    minLength: {
                      value: 6,
                      message: "Le mot de passe doit contenir au moins 6 caractères"
                    }
                  })}
                  error={errors.newPassword?.message}
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="Confirmer le nouveau mot de passe"
                  className="rounded-xl"
                  prefix={<LockClosedIcon className="size-4.5" />}
                  {...register("confirmPassword", {
                    validate: (value) => {
                      const newPassword = watchNewPassword;
                      if (newPassword && !value) {
                        return "Veuillez confirmer votre mot de passe";
                      }
                      if (newPassword && value !== newPassword) {
                        return "Les mots de passe ne correspondent pas";
                      }
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
                  onClick={() => fetchProfile()}
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