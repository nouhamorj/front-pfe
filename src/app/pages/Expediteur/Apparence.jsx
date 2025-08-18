// src/app/pages/Appearance/AppearancePage.jsx

// Import Dependencies
import { Page } from "components/shared/Page";
import { Label, Radio, RadioGroup } from "@headlessui/react";
import clsx from "clsx";

// UI Components
import { Listbox } from "components/shared/form/Listbox";
import { Button, Switch } from "components/ui";

// Theme & Constants
import { useThemeContext } from "app/contexts/theme/context";
import { colors } from "constants/colors.constant";

export default function AppearancePage() {
  // Composant intégré : Appearance
  const Appearance = () => {
    const theme = useThemeContext();

    const primaryColors = ["indigo", "blue", "green", "amber", "purple", "rose"];

    const cardSkins = [
      { value: "shadow-sm", label: "Ombre" },
      { value: "bordered", label: "Avec bordure" },
    ];

    return (
      <div className="w-full max-w-3xl 2xl:max-w-5xl">
        <div className="space-y-8">
          {/* Thème (clair/sombre/système) */}
          <div>
            <div>
              <p className="text-base font-medium text-gray-800 dark:text-dark-100">
                Thème
              </p>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-dark-200">
                Vous pouvez sélectionner une couleur de thème dans la liste ci-dessous.
              </p>
            </div>
            <RadioGroup
              value={theme.themeMode}
              onChange={theme.setThemeMode}
              className="mt-4"
            >
              <Label className="sr-only">Mode du thème (sombre ou clair)</Label>
              <div className="mt-2 flex flex-wrap gap-6">
                {/* Système */}
                <Radio value="system" className="w-44 cursor-pointer outline-none">
                  {({ checked }) => (
                    <div className="text-center">
                      <div
                        className={clsx(
                          "relative overflow-hidden rounded-lg border-2 bg-dark-900 dark:border-transparent",
                          checked &&
                            "ring-2 ring-primary-600 ring-offset-2 ring-offset-white dark:ring-primary-500 dark:ring-offset-dark-700"
                        )}
                      >
                        <div
                          style={{ clipPath: "polygon(50% 50%, 100% 0, 0 0, 0% 100%)" }}
                          className="w-full space-y-2 bg-gray-50 p-1.5"
                        >
                          <div className="w-full space-y-2 rounded-sm bg-white p-2 shadow-xs">
                            <div className="h-2 w-9/12 rounded-lg bg-gray-150"></div>
                            <div className="h-2 w-11/12 rounded-lg bg-gray-150"></div>
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-xs">
                            <div className="size-4 shrink-0 rounded-full bg-gray-150"></div>
                            <div className="h-2 w-full rounded-lg bg-gray-150"></div>
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-xs">
                            <div className="size-4 shrink-0 rounded-full bg-gray-150"></div>
                            <div className="h-2 w-9/12 rounded-lg bg-gray-150"></div>
                          </div>
                        </div>
                        <div
                          style={{ clipPath: "polygon(50% 50%, 100% 0, 100% 100%, 0% 100%)" }}
                          className="absolute inset-0 space-y-2 p-1.5"
                        >
                          <div className="w-full space-y-2 rounded-sm bg-dark-700 p-2 shadow-xs">
                            <div className="h-2 w-9/12 rounded-lg bg-dark-400"></div>
                            <div className="h-2 w-11/12 rounded-lg bg-dark-400"></div>
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-dark-700 p-2 shadow-xs">
                            <div className="size-4 shrink-0 rounded-full bg-dark-400"></div>
                            <div className="h-2 w-full rounded-lg bg-dark-400"></div>
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-dark-700 p-2 shadow-xs">
                            <div className="size-4 shrink-0 rounded-full bg-dark-400"></div>
                            <div className="h-2 w-9/12 rounded-lg bg-dark-400"></div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-1.5 text-center">Système</p>
                    </div>
                  )}
                </Radio>

                {/* Clair */}
                <Radio value="light" className="w-44 cursor-pointer outline-none">
                  {({ checked }) => (
                    <div className="text-center">
                      <div
                        className={clsx(
                          "relative overflow-hidden rounded-lg border-2 dark:border-transparent",
                          checked &&
                            "ring-2 ring-primary-600 ring-offset-2 ring-offset-white dark:ring-primary-500 dark:ring-offset-dark-700"
                        )}
                      >
                        <div className="w-full space-y-2 bg-gray-50 p-1.5">
                          <div className="w-full space-y-2 rounded-sm bg-white p-2 shadow-xs">
                            <div className="h-2 w-9/12 rounded-lg bg-gray-150"></div>
                            <div className="h-2 w-11/12 rounded-lg bg-gray-150"></div>
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-xs">
                            <div className="size-4 shrink-0 rounded-full bg-gray-150"></div>
                            <div className="h-2 w-full rounded-lg bg-gray-150"></div>
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-xs">
                            <div className="size-4 shrink-0 rounded-full bg-gray-150"></div>
                            <div className="h-2 w-9/12 rounded-lg bg-gray-150"></div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-1.5 text-center">Clair</p>
                    </div>
                  )}
                </Radio>

                {/* Sombre */}
                <Radio value="dark" className="w-44 cursor-pointer outline-none">
                  {({ checked }) => (
                    <div className="text-center">
                      <div
                        className={clsx(
                          "relative overflow-hidden rounded-lg border border-transparent bg-dark-900",
                          checked &&
                            "ring-2 ring-primary-600 ring-offset-2 ring-offset-white dark:ring-primary-500 dark:ring-offset-dark-700"
                        )}
                      >
                        <div className="w-full space-y-2 bg-dark-900 p-1.5">
                          <div className="w-full space-y-2 rounded-sm bg-dark-700 p-2 shadow-xs">
                            <div className="h-2 w-9/12 rounded-lg bg-dark-400"></div>
                            <div className="h-2 w-11/12 rounded-lg bg-dark-400"></div>
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-dark-700 p-2 shadow-xs">
                            <div className="size-4 shrink-0 rounded-full bg-dark-400"></div>
                            <div className="h-2 w-full rounded-lg bg-dark-400"></div>
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-dark-700 p-2 shadow-xs">
                            <div className="size-4 shrink-0 rounded-full bg-dark-400"></div>
                            <div className="h-2 w-9/12 rounded-lg bg-dark-400"></div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-1.5 text-center">Sombre</p>
                    </div>
                  )}
                </Radio>
              </div>
            </RadioGroup>
          </div>

          {/* Couleur primaire */}
          <div>
            <div>
              <p className="text-base font-medium text-gray-800 dark:text-dark-100">
                Couleur Primaire
              </p>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-dark-200">
                Choisissez une couleur qui sera utilisée comme couleur principale pour votre thème.
              </p>
            </div>
            <RadioGroup
              value={theme.primaryColorScheme.name}
              onChange={theme.setPrimaryColorScheme}
              className="mt-2"
            >
              <Label className="sr-only">Choisir la couleur primaire</Label>
              <div className="mt-2 flex w-fit flex-wrap gap-4 sm:gap-5">
                {primaryColors.map((color) => (
                  <Radio
                    key={color}
                    value={color}
                    className={({ checked }) =>
                      clsx(
                        "flex h-14 w-16 cursor-pointer items-center justify-center rounded-lg border outline-none",
                        checked
                          ? "border-primary-500"
                          : "border-gray-200 dark:border-dark-500"
                      )
                    }
                  >
                    {({ checked }) => (
                      <div
                        className={clsx(
                          "mask is-diamond size-6 transition-all",
                          checked && "rotate-45 scale-110"
                        )}
                        style={{
                          backgroundColor: colors[color][500],
                        }}
                      ></div>
                    )}
                  </Radio>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Card Skin & Monochrome Mode */}
        <div className="my-6 h-px bg-gray-200 dark:bg-dark-500"></div>

        <div className="space-y-5">
          {/* Card Skin */}
          <div className="grid grid-cols-1 md:grid-cols-3">
            <p className="my-auto">Aspect de la carte</p>
            <Listbox
              classNames={{
                root: "mt-1.5 flex-1 md:col-span-2 md:mt-0",
              }}
              data={cardSkins}
              value={cardSkins.find((skin) => skin.value === theme.cardSkin)}
              onChange={({ value }) => theme.setCardSkin(value)}
            />
          </div>

          {/* Monochrome Mode */}
          <div className="grid grid-cols-1 md:grid-cols-3">
            <p className="my-auto">Thème Mode chromatique :</p>
            <div className="mt-1.5 flex flex-1 items-center justify-between space-x-2 rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-450 md:col-span-2 md:mt-0">
              <p className="text-gray-800 dark:text-dark-100">Monochrome Mode</p>
              <Switch
                checked={theme.isMonochrome}
                onChange={(e) => theme.setMonochromeMode(e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-10">
          <Button color="primary" onClick={theme.resetTheme}>
            Réinitialiser le thème
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Page title="Apparence">
      <div className="w-full max-w-6xl mx-auto px-(--margin-x) py-6">
        {/* En-tête */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-dark-50">Apparence</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-200">
            Personnalisez l’interface selon vos préférences.
          </p>
        </div>

        {/* Section : Apparence */}
        <div className="overflow-hidden bg-white dark:bg-dark-900 rounded-xl shadow-md border border-gray-200 dark:border-dark-700">
          <div className="p-6">
            <Appearance />
          </div>
        </div>
      </div>
    </Page>
  );
}