import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import Logo from "assets/logo.svg?react";
import { Button, Card, Input, InputErrorMsg } from "components/ui";
import * as Yup from "yup";
import { Page } from "components/shared/Page";

// Validation schema
const schema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .matches(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Le mot de passe doit contenir au moins un caractère spécial")
    .required("Le nouveau mot de passe est requis"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Les mots de passe doivent correspondre")
    .required("La confirmation du mot de passe est requise"),
});

export default function ResetPassword() {
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token: token,
          newPassword: data.newPassword 
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(result.message || "Mot de passe réinitialisé avec succès.");
        setErrorMessage(null);
        reset();
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate("/se-connecter");
        }, 3000);
      } else {
        setErrorMessage(result.message || "Une erreur est survenue. Veuillez réessayer.");
        setSuccessMessage(null);
      }
    } catch {
      setErrorMessage("Une erreur est survenue. Veuillez vérifier votre connexion.");
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page title="Réinitialisation du mot de passe">
      <main className="min-h-screen flex w-full items-center justify-center py-12">
        <div className="w-full max-w-md p-6 sm:p-8">
          <div className="text-center mb-8">
            <Logo className="mx-auto" style={{ height: "80px" }} aria-label="Logo de l'application" />
          </div>
          <Card
            className="rounded-xl p-6 sm:p-8 shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{ borderColor: "#272E6480", backgroundColor: "#FFFFFF" }}
          >
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" noValidate>
              <div className="space-y-6">
                <Input
                  type={showPassword ? "text" : "password"}
                  style={{
                    borderColor: "#272E6480",
                    color: "#272E64",
                    transition: "border-color 0.3s ease",
                  }}
                  label="Nouveau mot de passe"
                  placeholder="Entrer votre nouveau mot de passe"
                  
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-[#272E64] transition-colors duration-200"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="size-5" strokeWidth="1" />
                      ) : (
                        <EyeIcon className="size-5" strokeWidth="1" />
                      )}
                    </button>
                  }
                  {...register("newPassword")}
                  error={errors?.newPassword?.message}
                  aria-invalid={errors?.newPassword ? "true" : "false"}
                  className="focus:ring-2 focus:ring-[#FEC327] focus:border-[#FEC327]"
                />

                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  style={{
                    borderColor: "#272E6480",
                    color: "#272E64",
                    transition: "border-color 0.3s ease",
                  }}
                  label="Confirmer le mot de passe"
                  placeholder="Confirmer votre nouveau mot de passe"
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-500 hover:text-[#272E64] transition-colors duration-200"
                      aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="size-5" strokeWidth="1" />
                      ) : (
                        <EyeIcon className="size-5" strokeWidth="1" />
                      )}
                    </button>
                  }
                  {...register("confirmPassword")}
                  error={errors?.confirmPassword?.message}
                  aria-invalid={errors?.confirmPassword ? "true" : "false"}
                  className="focus:ring-2 focus:ring-[#FEC327] focus:border-[#FEC327]"
                />
              </div>

              <div className="mt-4">
                {errorMessage && (
                  <InputErrorMsg when={!!errorMessage}>
                    {errorMessage}
                  </InputErrorMsg>
                )}
                {successMessage && (
                  <div
                    className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md"
                    role="alert"
                  >
                    {successMessage}
                    <div className="text-xs mt-1">Redirection vers la page de connexion...</div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="mt-6 w-full font-semibold transition-all duration-300 hover:bg-[#e6b223]"
                style={{ backgroundColor: "#FEC327", color: "#272E64" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-[#272E64]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                      />
                    </svg>
                    Réinitialisation en cours...
                  </span>
                ) : (
                  "Réinitialiser le mot de passe"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/se-connecter"
                className="text-sm text-gray-500 hover:text-[#272E64] dark:text-dark-300 dark:hover:text-dark-100 transition-colors duration-200"
                aria-label="Retourner à la page de connexion"
              >
                Retour à la connexion
              </a>
            </div>
          </Card>
          <div className="mt-8 text-center text-xs text-gray-400 dark:text-dark-300">
            Developed with passion by ShippingLog
          </div>
        </div>
      </main>
    </Page>
  );
}