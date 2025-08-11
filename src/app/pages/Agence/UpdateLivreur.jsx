// ModifierLivreurAgence.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button, Input } from "components/ui";
import { Page } from "components/shared/Page";
import { useAuthContext } from "app/contexts/auth/context";

export default function ModifierLivreurAgence() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
      salarier: "1",
      login: "",
      email: "",
    },
  });

  const salarier = watch("salarier");
  const agenceId = user?.relatedIds?.id; // ✅ Récupéré depuis le contexte

  // Charger les données du livreur
  useEffect(() => {
    const fetchLivreur = async () => {
      try {
        if (!agenceId) throw new Error("Agence non trouvée");

        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) throw new Error("Token d'authentification manquant");

        const livreurRes = await fetch(`http://localhost:3000/api/livreurs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!livreurRes.ok) throw new Error("Erreur lors du chargement du livreur");

        const livreur = await livreurRes.json();

        // Vérifier que le livreur appartient à l'agence de l'utilisateur
        if (livreur.id_agence !== agenceId) {
          toast.error("Accès refusé : ce livreur n'appartient pas à votre agence");
          navigate("/agence/liste-livreurs");
          return;
        }

        // Charger les données utilisateur
        const userRes = await fetch(`http://localhost:3000/api/users/${livreur.user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!userRes.ok) throw new Error("Erreur lors du chargement des données utilisateur");

        const userData = await userRes.json();
        const user = userData.user;

        // Pré-remplir les champs
        setValue("nom", livreur.nom);
        setValue("tel", livreur.tel);
        setValue("tel2", livreur.tel2);
        setValue("matricule", livreur.matricule);
        setValue("cin", livreur.cin);
        setValue("secteur", livreur.secteur);
        setValue("salarier", livreur.salarier.toString());
        setValue("salaire", livreur.salaire || "");
        setValue("prestation", livreur.prestation || "");
        setValue("login", user.login || "");
        setValue("email", user.email || "");
      } catch (err) {
        toast.error(err.message);
        console.error(err);
      }
    };

    if (id && agenceId) {
      fetchLivreur();
    }
  }, [id, agenceId, setValue, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) throw new Error("Token d'authentification manquant");

      const formData = {
        nom: data.nom,
        tel: data.tel,
        tel2: data.tel2,
        matricule: data.matricule,
        cin: data.cin,
        secteur: data.secteur,
        salarier: parseInt(data.salarier),
        id_agence: agenceId, // ✅ Envoyé en interne, pas affiché
      };

      if (formData.salarier === 1) {
        formData.salaire = data.salaire;
      } else {
        formData.prestation = data.prestation;
      }

      const res = await fetch(`http://localhost:3000/api/livreurs/update/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour");
      }

      toast.success("Livreur modifié avec succès !");
      navigate("/agence/liste-livreurs");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Modifier livreur">
      <div className="w-full max-w-4xl 2xl:max-w-6xl p-6 bg-white dark:bg-dark-800 rounded-xl shadow-md">
        <h5 className="text-lg font-semibold text-gray-800 dark:text-dark-50 mb-1">
          Modifier un livreur
        </h5>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* Informations personnelles */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Nom"
              placeholder="Nom complet"
              {...register("nom", { required: "Champ requis" })}
              error={errors.nom?.message}
            />
            <Input
              label="Téléphone"
              placeholder="Téléphone"
              {...register("tel", { required: "Champ requis" })}
              error={errors.tel?.message}
            />
            <Input
              label="Téléphone secondaire"
              placeholder="Téléphone 2"
              {...register("tel2")}
            />
            <Input
              label="Matricule"
              placeholder="Matricule"
              {...register("matricule", { required: "Champ requis" })}
              error={errors.matricule?.message}
            />
            <Input
              label="CIN"
              placeholder="Carte d'identité"
              {...register("cin", { required: "Champ requis" })}
              error={errors.cin?.message}
            />
            <Input
              label="Secteur"
              placeholder="Secteur"
              {...register("secteur", { required: "Champ requis" })}
              error={errors.secteur?.message}
            />

            {/* Type de contrat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
                Type de contrat
              </label>
              <div className="flex flex-col gap-2"> {/* Changement ici */}
                <label className="flex items-center">
                  <input type="radio" value="1" {...register("salarier")} />
                  <span className="ml-2">Salarié</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" value="0" {...register("salarier")} />
                  <span className="ml-2">Prestataire</span>
                </label>
              </div>
            </div>


            {salarier === "1" && (
              <Input
                label="Salaire (DT)"
                placeholder="Montant du salaire"
                type="number"
                step="0.01"
                {...register("salaire", {
                  required: "Salaire requis",
                  min: { value: 0, message: "Doit être positif" },
                })}
                error={errors.salaire?.message}
              />
            )}

            {salarier === "0" && (
              <Input
                label="Prestation (DT)"
                placeholder="Montant de la prestation"
                type="number"
                step="0.01"
                {...register("prestation", {
                  required: "Prestation requise",
                  min: { value: 0, message: "Doit être positif" },
                })}
                error={errors.prestation?.message}
              />
            )}
          </div>

          {/* Identifiants (lecture seule) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 border-t pt-6">
            <Input
              label="Login"
              value={watch("login") || ""}
              disabled
              className="rounded-xl bg-gray-100 dark:bg-dark-700 cursor-not-allowed text-gray-700 dark:text-gray-300"
            />
            <Input
              label="Email"
              type="email"
              value={watch("email") || ""}
              disabled
              className="rounded-xl bg-gray-100 dark:bg-dark-700 cursor-not-allowed text-gray-700 dark:text-gray-300"
            />
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => navigate(-1)}
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