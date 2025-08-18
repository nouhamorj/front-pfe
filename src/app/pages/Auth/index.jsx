// Import Dependencies
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

// Local Imports
import Logo from "assets/logo.svg?react";
import { Button, Card, Checkbox, Input, InputErrorMsg } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";
import { schema } from "./schema";
import { Page } from "components/shared/Page";

export default function SignIn() {
  const { login, errorMessage } = useAuthContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema)
  });

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = (data) => {
    login({
      login: data.login,
      pwd: data.pwd,
    });
  };

  return (
    <Page title="Login">
      <main
        className="min-h-100vh grid w-full grow grid-cols-1 place-items-center"
        style={{backgroundColor:'#e8f0feb0'}}
      >
        <div className="w-full max-w-[26rem] p-4 sm:px-5">
          <div className="text-center">
            <Logo className="mx-auto" style={{ height: "70px" }} />
          </div>
          <Card
            className="mt-5 rounded-lg p-5 lg:p-7"
            style={{ borderColor: " #272E6480", backgroundColor :"#fff" }}
          >
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div className="space-y-4">
                <Input
                  style={{ borderColor: " #272E6480", color: " #272E64" }}
                  label="Login"
                  placeholder="Entrer votre login"
                  prefix={
                    <UserIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("login")}
                  error={errors?.login?.message}
                />
                <Input
                  style={{borderColor:' #272E6480', color:' #272E64'}}
                  label="Mot de passe"
                  placeholder="Entrer votre mot de passe"
                  type={showPassword ? "text" : "password"}
                  prefix={<LockClosedIcon className="size-5" strokeWidth="1" />}
                  suffix={
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="size-5 text-gray-500" />
                      ) : (
                        <EyeIcon className="size-5 text-gray-500" />
                      )}
                    </button>
                  }
                  {...register("pwd")}
                  error={errors?.pwd?.message}
                />
              </div>

              <div className="mt-2">
                <InputErrorMsg when={!!errorMessage}>
                  {errorMessage}
                </InputErrorMsg>
              </div>

              <div className="mt-4 flex items-center justify-between space-x-2">
                <Checkbox label="Se souvenir de moi" />
                <a
                  href="/mot-de-passe-oublie"
                  className="text-xs text-gray-400 transition-colors hover:text-gray-800 focus:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100 dark:focus:text-dark-100"
                >
                  Mot de passe oublié ?
                </a>
              </div>

              <Button
                type="submit"
                className="mt-5 w-full"
                style={{ backgroundColor: "#FEC327", color: "#272E64" }}
              >
                Se connecter
              </Button>
            </form>
          </Card>
          <div className="mt-8 flex justify-center text-xs text-gray-400 dark:text-dark-300">
            <a href="##">Developed with passion by ShippingLog</a>
          </div>
        </div>
      </main>
    </Page>
  );
}
