import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Button, Input } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { Page } from "components/shared/Page";

const defaultValues = {
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
};

export default function AddLivreur() {
const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agenceOptions, setAgenceOptions] = useState([]);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setError,
    formState: { errors },
  } = useForm({ defaultValues });

  const salarier = Number(watch("salarier"));
  const pwd = watch("pwd");

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

        if (!response.ok) throw new Error("Erreur lors de la récupération des agences");

        const data = await response.json();
        setAgenceOptions(data.map(agence => ({ 
          id: agence.id, 
          name: agence.libelle 
        })));
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchAgences();
  }, []);

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

      // Gestion des champs conditionnels
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

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.message?.includes("Duplicate entry") && errorData.message?.includes("for key 'login'")) {
          setError("login", {
            type: "manual",
            message: "Ce login est déjà utilisé, veuillez en choisir un autre.",
          });
          return;
        }

        throw new Error(errorData.message || "Erreur lors de la création du livreur");
      }

      toast.success("Livreur ajouté avec succès !");
        navigate("/admin/liste-livreurs");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const PasswordVisibilityToggle = ({ show, toggle }) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute top-9 right-3 text-gray-500 hover:text-gray-900 dark:hover:text-white"
      aria-label={show ? "Cacher le mot de passe" : "Afficher le mot de passe"}
    >
      {show ? "🙈" : "👁️"}
    </button>
  );

  return (
    <Page title="Ajout livreur">
      <div className="w-full max-w-4xl 2xl:max-w-6xl p-6 bg-white dark:bg-dark-800 rounded-xl shadow-md">
        <h5 className="text-lg font-semibold text-gray-800 dark:text-dark-50 mb-1">
          Ajouter un livreur
        </h5>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* Section Informations personnelles */}
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

            {/* Type de contrat */}
            <div className="space-y-2">
                <span className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                    Type de contrat
                </span>
                <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                    <input 
                        type="radio" 
                        value={1} 
                        {...register("salarier")} 
                        defaultChecked 
                    />
                    <span>Salarié</span>
                    </label>
                    <label className="flex items-center space-x-2">
                    <input 
                        type="radio" 
                        value={0} 
                        {...register("salarier")} 
                    />
                    <span>Prestataire</span>
                    </label>
                </div>
            </div>

            {salarier === 1 && (
              <Input
                label="Salaire"
                placeholder="Montant du salaire"
                type="number"
                step="0.01"
                {...register("salaire", { 
                  required: "Salaire requis", 
                  min: 0 
                })}
                error={errors.salaire?.message}
              />
            )}

            {salarier === 0 && (
              <Input
                label="Prestation"
                placeholder="Montant de la prestation"
                type="number"
                step="0.01"
                {...register("prestation", { 
                  required: "Prestation requise", 
                  min: 0 
                })}
                error={errors.prestation?.message}
              />
            )}
          </div>

          {/* Section Authentification */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 border-t pt-6">
            <Input
              label="Login"
              placeholder="Identifiant"
              {...register("login", { required: "Login requis" })}
              error={errors.login?.message}
            />
            
            <Input
              label="Email"
              placeholder="Adresse email"
              type="email"
              {...register("email", {
                required: "Email requis",
                pattern: {
                  value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  message: "Email invalide",
                },
              })}
              error={errors.email?.message}
            />
            
            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPwd ? "text" : "password"}
                placeholder="Mot de passe"
                {...register("pwd", {
                  required: "Mot de passe requis",
                  minLength: { 
                    value: 6, 
                    message: "Au moins 6 caractères" 
                  },
                })}
                error={errors.pwd?.message}
              />
              <PasswordVisibilityToggle 
                show={showPwd} 
                toggle={() => setShowPwd(!showPwd)} 
              />
            </div>
            
            <div className="relative">
              <Input
                label="Confirmer mot de passe"
                type={showConfirmPwd ? "text" : "password"}
                placeholder="Confirmation"
                {...register("confirmPwd", {
                  required: "Confirmation requise",
                  validate: value => 
                    value === pwd || "Les mots de passe ne correspondent pas",
                })}
                error={errors.confirmPwd?.message}
              />
              <PasswordVisibilityToggle 
                show={showConfirmPwd} 
                toggle={() => setShowConfirmPwd(!showConfirmPwd)} 
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              onClick={() => window.history.back()} 
              variant="outline"
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