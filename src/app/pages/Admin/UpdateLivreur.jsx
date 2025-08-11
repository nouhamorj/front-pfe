import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button, Input } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { Page } from "components/shared/Page";                                                                                 

export default function EditLivreur() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [agenceOptions, setAgenceOptions] = useState([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
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
      salarier: "1", // Default to string to match radio button values
      id_agence: null,
      login: "",
      email: "",
      pwd: "",
    },
  });

  const salarier = watch("salarier");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) throw new Error("Token d'authentification manquant");

        const [agenceRes, livreurRes] = await Promise.all([
          fetch("http://localhost:3000/api/agences", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(`http://localhost:3000/api/livreurs/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (!agenceRes.ok || !livreurRes.ok) throw new Error("Erreur de chargement des données");

        const agences = await agenceRes.json();
        const livreur = await livreurRes.json();

        // Fetch user data for login and email
        const userRes = await fetch(`http://localhost:3000/api/users/${livreur.user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!userRes.ok) throw new Error("Erreur de chargement des données utilisateur");

        const userData = await userRes.json();
        const user = userData.user;

        // Set agency options
        const formattedAgences = agences.map(a => ({ id: a.id, name: a.libelle }));
        setAgenceOptions(formattedAgences);

        // Pré-remplir les champs
        setValue("nom", livreur.nom);
        setValue("tel", livreur.tel);
        setValue("tel2", livreur.tel2);
        setValue("matricule", livreur.matricule);
        setValue("cin", livreur.cin);
        setValue("secteur", livreur.secteur);
        setValue("salarier", livreur.salarier.toString()); // Convert to string for radio buttons
        setValue("salaire", livreur.salaire || "");
        setValue("prestation", livreur.prestation || "");
        
        // Find and set the agency object
        const selectedAgence = formattedAgences.find(a => a.id === livreur.id_agence) || null;
        if (!selectedAgence && livreur.id_agence) {
          console.warn(`Agency with id ${livreur.id_agence} not found in agenceOptions`);
        }
        setValue("id_agence", selectedAgence);
        
        setValue("login", user.login || "");
        setValue("email", user.email || "");
      } catch (err) {
        toast.error(err.message);
      }
    };

    fetchData();
  }, [id, setValue]);

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
        id_agence: data.id_agence?.id || null,
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

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      toast.success("Livreur modifié avec succès !");
      navigate("/admin/liste-livreurs");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Modifier livreur">
      <div className="w-full max-w-4xl 2xl:max-w-6xl p-6 bg-white dark:bg-dark-800 rounded-xl shadow-md">
        <h5 className="text-lg font-semibold text-gray-800 dark:text-dark-50 mb-1">Modifier un livreur</h5>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="Nom" placeholder="Nom complet" {...register("nom", { required: "Champ requis" })} error={errors.nom?.message} />
            <Input label="Téléphone" placeholder="Téléphone" {...register("tel", { required: "Champ requis" })} error={errors.tel?.message} />
            <Input label="Téléphone secondaire" placeholder="Téléphone 2" {...register("tel2")} />
            <Input label="Matricule" placeholder="Matricule" {...register("matricule", { required: "Champ requis" })} error={errors.matricule?.message} />
            <Input label="CIN" placeholder="Carte d'identité" {...register("cin", { required: "Champ requis" })} error={errors.cin?.message} />
            <Input label="Secteur" placeholder="Secteur" {...register("secteur", { required: "Champ requis" })} error={errors.secteur?.message} />

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
                  onChange={val => field.onChange(val)}
                />
              )}
            />

            {/* Type de contrat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">Type de contrat</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input type="radio" value="1" {...register("salarier")} /> <span className="ml-2">Salarié</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" value="0" {...register("salarier")} /> <span className="ml-2">Prestataire</span>
                </label>
              </div>
            </div>

            {salarier === "1" && (
              <Input
                label="Salaire"
                placeholder="Montant du salaire"
                type="number"
                step="0.01"
                {...register("salaire", { required: "Salaire requis", min: 0 })}
                error={errors.salaire?.message}
              />
            )}

            {salarier === "0" && (
              <Input
                label="Prestation"
                placeholder="Montant de la prestation"
                type="number"
                step="0.01"
                {...register("prestation", { required: "Prestation requise", min: 0 })}
                error={errors.prestation?.message}
              />
            )}
          </div>

          {/* Informations non modifiables */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 border-t pt-6">
            <Input label="Login" disabled {...register("login")} />
            <Input label="Email" type="email" disabled {...register("email")} />

          </div>

          {/* Boutons */}
          <div className="mt-8 flex justify-end space-x-3">
            <Button type="button" onClick={() => window.history.back()} className="min-w-[7rem]">
              Annuler
            </Button>
            <Button type="submit" color="primary" disabled={loading} className="min-w-[7rem]">
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
}