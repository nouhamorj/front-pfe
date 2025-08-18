import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Logo from "assets/logo.svg?react";
import { Button, Card, Input, InputErrorMsg } from "components/ui";
import * as Yup from "yup";
import { Page } from "components/shared/Page";

// Validation schema
const schema = Yup.object().shape({
  email: Yup.string()
    .email("Veuillez entrer une adresse email valide")
    .required("L'adresse email est requise"),
});

export default function ForgotPassword() {
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
      const response = await fetch("http://localhost:3000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(result.message || "Email de réinitialisation envoyé.");
        setErrorMessage(null);
        reset();
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
    <Page title="Mot de passe oublié">
      <main className="min-h-screen flex w-full items-center justify-center py-12" 
      style={{backgroundColor:"#e8f0feb0"}}>
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
                  style={{
                    borderColor: "#272E6480",
                    color: "#272E64",
                    transition: "border-color 0.3s ease",
                  }}
                  label="Adresse email"
                  placeholder="Entrer votre adresse email"
                  prefix={
                    <EnvelopeIcon
                      className="size-5 text-gray-500 transition-colors duration-200"
                      strokeWidth="1"
                      aria-hidden="true"
                    />
                  }
                  {...register("email")}
                  error={errors?.email?.message}
                  aria-invalid={errors?.email ? "true" : "false"}
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
                    Envoi en cours...
                  </span>
                ) : (
                  "Envoyer le lien de réinitialisation"
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