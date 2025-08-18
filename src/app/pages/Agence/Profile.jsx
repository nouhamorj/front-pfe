// src/app/pages/Profile/Profile.jsx

import { Page } from "components/shared/Page";
import { UserIcon, EnvelopeIcon, PhoneIcon, DocumentTextIcon, LockClosedIcon } from "@heroicons/react/24/outline";
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
      libelle: "",
      prenomResp: "",
      nomResp: "",
      cinResp: "",
      telResp: "",
      telAgence: "",
      email: "",
      login: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchNewPassword = watch("newPassword");

  // 🔑 Récupérer le token et relatedId
  const getAuthToken = () => localStorage.getItem("authToken");

  const getRelatedId = () => {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.relatedId || null;
    } catch (error) {
      console.error("Token invalide", error);
      return null;
    }
  };

  // 📥 Charger le profil de l'agence
  const fetchProfile = async () => {
    const token = getAuthToken();
    const relatedId = getRelatedId();

    if (!token || !relatedId) {
      toast.error("Session expirée ou données manquantes");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/agences/profile/${relatedId}`, {
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
        libelle: data.libelle || "",
        prenomResp: data.prenomResp || "",
        nomResp: data.nomResp || "",
        cinResp: data.cinResp || "",
        telResp: data.telResp || "",
        telAgence: data.tel_agence || "",
        email: data.email || "",
        login: data.login || "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Erreur chargement profil:", error);
      toast.error("Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Soumettre la mise à jour
  const onSubmit = async (formData) => {
    const token = getAuthToken();
    const relatedId = getRelatedId();

    if (!token || !relatedId || !profileData) {
      toast.error("Session expirée");
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
        user_id: profileData.user_id, // requis pour la mise à jour
        libelle: formData.libelle,
        prenomResp: formData.prenomResp,
        nomResp: formData.nomResp,
        cinResp: formData.cinResp,
        telResp: formData.telResp,
        tel_agence: formData.telAgence,
        email: formData.email,
        login: formData.login,
      };

      // Ajouter mot de passe seulement s'il est saisi
      if (formData.newPassword && formData.newPassword.trim()) {
        payload.password = formData.newPassword;
      }

      const res = await fetch(`http://localhost:3000/api/agences/update/${relatedId}`, {
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

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Page title="Profil Agence">
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg text-gray-600">Chargement du profil...</p>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Profil Agence">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* En-tête */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-dark-50">Profil Agence</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-200">
            Mettez à jour les informations de votre agence et vos identifiants.
          </p>
        </div>

        {/* Formulaire */}
        <div className="overflow-hidden bg-white dark:bg-dark-900 rounded-xl shadow-md border border-gray-200 dark:border-dark-700">
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-8xl">

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 [&_.prefix]:pointer-events-none">
                {/* Libellé agence */}
                <Input
                  label="Libellé de l'agence"
                  placeholder="Agence Sousse"
                  className="rounded-xl"
                  prefix={<UserIcon className="size-4.5" />}
                  {...register("libelle", { required: "Libellé requis" })}
                  error={errors.libelle?.message}
                />

                {/* Responsable - Prénom */}
                <Input
                  label="Prénom du responsable"
                  placeholder="Imen"
                  className="rounded-xl"
                  prefix={<UserIcon className="size-4.5" />}
                  {...register("prenomResp", { required: "Prénom requis" })}
                  error={errors.prenomResp?.message}
                />

                {/* Responsable - Nom */}
                <Input
                  label="Nom du responsable"
                  placeholder="Rebai"
                  className="rounded-xl"
                  prefix={<UserIcon className="size-4.5" />}
                  {...register("nomResp", { required: "Nom requis" })}
                  error={errors.nomResp?.message}
                />

                {/* CIN du responsable */}
                <Input
                  label="CIN du responsable"
                  placeholder="11223344"
                  className="rounded-xl"
                  prefix={<DocumentTextIcon className="size-4.5" />}
                  {...register("cinResp", { required: "CIN requis" })}
                  error={errors.cinResp?.message}
                />

                {/* Téléphone du responsable */}
                <Input
                  label="Téléphone du responsable"
                  placeholder="20 40 40 40"
                  type="tel"
                  className="rounded-xl"
                  prefix={<PhoneIcon className="size-4.5" />}
                  {...register("telResp", { required: "Téléphone requis" })}
                  error={errors.telResp?.message}
                />

                {/* Téléphone de l'agence */}
                <Input
                  label="Téléphone de l'agence"
                  placeholder="73 200 000"
                  type="tel"
                  className="rounded-xl"
                  prefix={<PhoneIcon className="size-4.5" />}
                  {...register("telAgence", { required: "Numéro de l'agence requis" })}
                  error={errors.telAgence?.message}
                />

                {/* Email */}
                <Input
                  label="Email"
                  placeholder="agence@sousse.tn"
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
                  placeholder="imen.sousse"
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
                  placeholder="Confirmez le nouveau mot de passe"
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