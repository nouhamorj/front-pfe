import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Button, Input } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { Page } from "components/shared/Page";

// Valeurs par défaut
const defaultValues = {
  nom: "",
  tel: "",
  cin: "",
  matricule: "",
  salaire: "",
  id_agence: null,
};

export default function AddChauffeur() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agenceOptions, setAgenceOptions] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ defaultValues });

  // Charger les agences
  useEffect(() => {
    const fetchAgences = async () => {
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) throw new Error("Token d'authentification manquant");

        const response = await fetch("http://localhost:3000/api/agences", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Erreur lors du chargement des agences");

        const data = await response.json();
        setAgenceOptions(
          data.map((agence) => ({
            id: agence.id,
            name: agence.libelle,
          }))
        );
      } catch (error) {
        toast.error(error.message || "Impossible de charger les agences");
      }
    };

    fetchAgences();
  }, []);

  // Soumission du formulaire
  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) throw new Error("Token d'authentification manquant");

      // Construire le payload exact attendu par le backend
      const payload = {
        nom: formData.nom.trim(),
        tel: formData.tel.trim(),
        cin: formData.cin.trim(),
        matricule: formData.matricule.trim(),
        id_agence: Number(formData.id_agence?.id) || null,
        salaire: parseFloat(formData.salaire) || 0,
      };

      // Validation côté client
      if (!payload.nom) throw new Error("Le nom est obligatoire");
      if (!payload.tel) throw new Error("Le téléphone est obligatoire");
      if (!payload.cin) throw new Error("Le CIN est obligatoire");
      if (!payload.matricule) throw new Error("Le matricule est obligatoire");
      if (!payload.id_agence) throw new Error("Veuillez sélectionner une agence");
      if (isNaN(payload.salaire) || payload.salaire < 0) {
        throw new Error("Le salaire doit être un nombre positif");
      }

      const response = await fetch("http://localhost:3000/api/chauffeurs/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        // Gérer les erreurs spécifiques
        if (result.message?.includes("Duplicate entry")) {
          if (result.message.includes("cin")) {
            throw new Error("Ce CIN est déjà utilisé par un autre chauffeur.");
          }
          if (result.message.includes("matricule")) {
            throw new Error("Ce matricule est déjà utilisé.");
          }
        }
        throw new Error(result.message || "Erreur lors de l'ajout du chauffeur");
      }

      toast.success("Chauffeur ajouté avec succès !");
      navigate("/admin/liste-chauffeurs");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Ajouter un chauffeur">
      <div className="w-full max-w-8xl p-6 bg-white dark:bg-dark-800 rounded-xl shadow-md">
        <h5 className="text-lg font-semibold text-gray-800 dark:text-dark-50 mb-6">
          Nouveau chauffeur
        </h5>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* Informations personnelles */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label="Nom & Prénom"
              placeholder="Ex: Ahmed Ben Salah"
              {...register("nom", { required: "Champ requis" })}
              error={errors.nom?.message}
            />

            <Input
              label="Téléphone"
              placeholder="Ex: +216 20 123 456"
              {...register("tel", { required: "Champ requis" })}
              error={errors.tel?.message}
            />

            <Input
              label="CIN"
              placeholder="Numéro de carte d'identité"
              {...register("cin", { required: "Champ requis" })}
              error={errors.cin?.message}
            />

            <Input
              label="Matricule"
              placeholder="Ex: Tunis 1234 أ"
              {...register("matricule", { required: "Champ requis" })}
              error={errors.matricule?.message}
            />

            <Input
              label="Salaire (DT)"
              type="number"
              step="0.01"
              placeholder="Ex: 1500"
              {...register("salaire", {
                required: "Champ requis",
                min: { value: 0, message: "Doit être positif" },
              })}
              error={errors.salaire?.message}
            />

            <Controller
              name="id_agence"
              control={control}
              rules={{ required: "Champ requis" }}
              render={({ field }) => (
                <Listbox
                  data={agenceOptions}
                  {...field}
                  label="Agence"
                  placeholder="Sélectionner une agence"
                  displayField="name"
                  valueField="id"
                  error={errors.id_agence?.message}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="px-4 py-2"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={loading}
              className="px-6 py-2"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
}