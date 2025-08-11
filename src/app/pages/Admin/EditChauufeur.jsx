import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router";
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

export default function EditChauffeur() {
  const { id } = useParams(); // Récupère l'ID depuis l'URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [agenceOptions, setAgenceOptions] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({ defaultValues });

  // --- 1. Charger les agences ---
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

  // --- 2. Charger le chauffeur à modifier ---
  useEffect(() => {
    const fetchChauffeur = async () => {
      setFetchLoading(true);
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) throw new Error("Token d'authentification manquant");

        const response = await fetch(`http://localhost:3000/api/chauffeurs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Chauffeur non trouvé");
          }
          throw new Error("Erreur lors du chargement du chauffeur");
        }

        const chauffeur = await response.json();

        // Pré-remplir le formulaire
        reset({
          nom: chauffeur.nom || "",
          tel: chauffeur.tel || "",
          cin: chauffeur.cin || "",
          matricule: chauffeur.matricule || "",
          salaire: chauffeur.salaire || "",
          id_agence: agenceOptions.find((a) => a.id === chauffeur.id_agence) || null,
        });
      } catch (error) {
        toast.error(error.message);
        navigate("/admin/liste-chauffeurs", { replace: true });
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) fetchChauffeur();
  }, [id, reset, agenceOptions, navigate]);

  // --- 3. Soumission du formulaire ---
  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) throw new Error("Token d'authentification manquant");

      // Préparer le payload
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

      const response = await fetch(`http://localhost:3000/api/chauffeurs/update/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.message?.includes("Duplicate entry")) {
          if (result.message.includes("cin")) {
            throw new Error("Ce CIN est déjà utilisé par un autre chauffeur.");
          }
          if (result.message.includes("matricule")) {
            throw new Error("Ce matricule est déjà utilisé.");
          }
        }
        throw new Error(result.message || "Erreur lors de la mise à jour");
      }

      toast.success("Chauffeur mis à jour avec succès !");
      navigate("/admin/liste-chauffeurs");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Page title="Modifier chauffeur">
        <div className="flex items-center justify-center p-16">
          <div className="text-center">
            <div className="size-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chargement du chauffeur...</h3>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Modifier chauffeur">
      <div className="w-full max-w-8xl p-6 bg-white dark:bg-dark-800 rounded-xl shadow-md">
        <h5 className="text-lg font-semibold text-gray-800 dark:text-dark-50 mb-6">
          Modifier le chauffeur
        </h5>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* Informations du chauffeur */}
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
              onClick={() => navigate("/admin/liste-chauffeurs")}
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
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
}