// Import Dependencies
import { PhoneIcon} from "@heroicons/react/20/solid";
import { EnvelopeIcon, UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";


import { Button, Input} from "components/ui";

// ----------------------------------------------------------------------

export default function General() {
   return (
    <div className="w-full max-w-3xl 2xl:max-w-5xl">
      <h5 className="text-lg font-medium text-gray-800 dark:text-dark-50">
        Général
      </h5>
      <p className="mt-0.5 text-balance text-sm text-gray-500 dark:text-dark-200">
        Mettre à jour vos informations
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 [&_.prefix]:pointer-events-none">
        <Input
          placeholder="Nom & prénom"
          label="Nom & prénom"
          className="rounded-xl"
          prefix={<UserIcon className="size-4.5" />}
        />
        <Input
          placeholder="Enter Email"
          label="Email"
          className="rounded-xl"
          prefix={<EnvelopeIcon className="size-4.5" />}
        />
        <Input
          placeholder="Numéro de téléphone"
          label="Phone Number"
          className="rounded-xl"
          prefix={<PhoneIcon className="size-4.5" />}
        />
        <Input
          placeholder="Numéro de téléphone secondaire"
          label="Numéro de téléphone secondaire :"
          className="rounded-xl"
          prefix={<PhoneIcon className="size-4.5" />}
        />
        <Input
          placeholder="Login"
          label="Login  :"
          className="rounded-xl"
          prefix={<UserIcon className="size-4.5" />}
        />
        <Input
          placeholder="Nouveau Mot de passe"
          label="Nouveau Mot de passe :"
          className="rounded-xl"
          prefix={<LockClosedIcon className="size-4.5" />}
        />
        <Input
          placeholder="Confirmer le mot de passe"
          label="Confirmer le mot de passe :"
          className="rounded-xl"
          prefix={<LockClosedIcon className="size-4.5" />}
        />
        
      </div>
      <div className="mt-8 flex justify-end space-x-3 ">
        <Button className="min-w-[7rem]">Annuler</Button>
        <Button className="min-w-[7rem]" color="primary">
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
