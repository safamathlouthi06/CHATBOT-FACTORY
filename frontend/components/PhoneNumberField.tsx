"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Phone,
  Search,
  ChevronDown,
  Check,
} from "lucide-react";

import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  AsYouType,
  type CountryCode,
} from "libphonenumber-js";

/* =========================================================
   TYPES
========================================================= */

export type Country = {
  code: CountryCode;
  name: string;
  dialCode: string;
  flagUrl: string;
};

/* =========================================================
   CONSTANTES
========================================================= */

const DEFAULT_COUNTRY: CountryCode = "TN";

/* =========================================================
   FLAG
========================================================= */

function getFlagUrl(countryCode: string) {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}

/* =========================================================
   NOM DU PAYS
========================================================= */

function getCountryName(countryCode: CountryCode) {
  const displayNames = new Intl.DisplayNames(["fr"], {
    type: "region",
  });

  return displayNames.of(countryCode) || countryCode;
}

/* =========================================================
   LISTE DES PAYS
========================================================= */

export const COUNTRIES: Country[] = getCountries()
  .map((code) => ({
    code,
    name: getCountryName(code),
    dialCode: `+${getCountryCallingCode(code)}`,
    flagUrl: getFlagUrl(code),
  }))
  .sort((a, b) =>
    a.name.localeCompare(b.name, "fr")
  );

/* =========================================================
   VALIDATION
========================================================= */

export function isPhoneNumberValid(
  value: string,
  country?: CountryCode
): boolean {
  if (!value?.trim()) {
    return true;
  }

  try {
    if (country) {
      return isValidPhoneNumber(value, country);
    }

    return isValidPhoneNumber(value);
  } catch {
    return false;
  }
}

/* =========================================================
   PROPS
========================================================= */

type PhoneNumberFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;

  editMode?: boolean;

  displayValue?: string;

  required?: boolean;

  placeholder?: string;

  showValidationHint?: boolean;

  className?: string;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function PhoneNumberField({
  label = "Téléphone",
  value,
  onChange,
  editMode = true,
  displayValue,
  required = false,
  placeholder,
  showValidationHint = true,
  className = "",
}: PhoneNumberFieldProps) {
  const [selectedCountry, setSelectedCountry] =
    useState<CountryCode>(DEFAULT_COUNTRY);

  const [showCountries, setShowCountries] =
    useState(false);

  const [countrySearch, setCountrySearch] =
    useState("");

  const containerRef =
    useRef<HTMLDivElement>(null);

  /* =========================================================
     DÉTECTER LE PAYS DEPUIS LE NUMÉRO EXISTANT
  ========================================================= */

  useEffect(() => {
    if (!value?.trim()) {
      return;
    }

    try {
      const parsed =
        parsePhoneNumberFromString(value);

      if (parsed?.country) {
        setSelectedCountry(parsed.country);
      }
    } catch {
      // On conserve TN par défaut
    }
  }, [value]);

  /* =========================================================
     CLICK EXTÉRIEUR
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setShowCountries(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     PAYS COURANT
  ========================================================= */

  const currentCountry = useMemo(() => {
    return (
      COUNTRIES.find(
        (country) =>
          country.code === selectedCountry
      ) ||
      COUNTRIES.find(
        (country) =>
          country.code === DEFAULT_COUNTRY
      )!
    );
  }, [selectedCountry]);

  /* =========================================================
     PAYS FILTRÉS
  ========================================================= */

  const filteredCountries = useMemo(() => {
    const search =
      countrySearch.trim().toLowerCase();

    if (!search) {
      return COUNTRIES;
    }

    return COUNTRIES.filter(
      (country) =>
        country.name
          .toLowerCase()
          .includes(search) ||
        country.dialCode.includes(search)
    );
  }, [countrySearch]);

  /* =========================================================
     VALIDATION
  ========================================================= */

  const isValid = useMemo(() => {
    if (!value?.trim()) {
      return null;
    }

    return isPhoneNumberValid(
      value,
      selectedCountry
    );
  }, [value, selectedCountry]);

  /* =========================================================
     CHANGEMENT PAYS
  ========================================================= */

  const handleCountryChange = (
    country: Country
  ) => {
    setSelectedCountry(country.code);

    onChange(`${country.dialCode} `);

    setShowCountries(false);
    setCountrySearch("");
  };

  /* =========================================================
     CHANGEMENT NUMÉRO
  ========================================================= */

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let input = e.target.value;

    /*
     * Autoriser uniquement :
     * chiffres
     * +
     * espaces
     * parenthèses
     * tirets
     */

    input = input.replace(
      /[^\d+\s()-]/g,
      ""
    );

    /*
     * IMPORTANT :
     * maintenant le téléphone peut réellement
     * être vidé puisqu'il est optionnel.
     */

    if (!input.trim()) {
      onChange("");
      return;
    }

    /*
     * Si l'utilisateur commence par +,
     * on conserve le numéro international.
     */

    if (input.startsWith("+")) {
      try {
        const formatter =
          new AsYouType(selectedCountry);

        onChange(formatter.input(input));
      } catch {
        onChange(input);
      }

      return;
    }

    /*
     * Si l'utilisateur saisit uniquement
     * des chiffres, ajouter automatiquement
     * l'indicatif du pays.
     */

    const digits =
      input.replace(/\D/g, "");

    if (!digits) {
      onChange("");
      return;
    }

    try {
      const formatter =
        new AsYouType(selectedCountry);

      onChange(
        formatter.input(
          `${currentCountry.dialCode}${digits}`
        )
      );
    } catch {
      onChange(
        `${currentCountry.dialCode} ${digits}`
      );
    }
  };

  /* =========================================================
     MODE LECTURE SEULE
  ========================================================= */

  if (!editMode) {
    const hasValue = Boolean(
      value?.trim()
    );

    return (
      <div className={className}>
        <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 mb-1.5">
          <span className="inline-flex mr-1.5 text-[#008080]">
            <Phone size={14} />
          </span>

          {label}
        </label>

        <p className="text-gray-700 dark:text-zinc-300 py-3 px-4 bg-[#F7FFFF] dark:bg-zinc-800/50 rounded-xl border border-[#E5F5F5] dark:border-zinc-700/50 break-words flex items-center gap-2">
          {hasValue && (
            <img
              src={currentCountry.flagUrl}
              alt={currentCountry.code}
              className="w-5 h-[14px] object-cover rounded-[2px] shadow-sm shrink-0"
              onError={(e) => {
                (
                  e.target as HTMLImageElement
                ).style.display = "none";
              }}
            />
          )}

          {!hasValue && (
            <Phone
              size={16}
              className="text-[#008080] shrink-0"
            />
          )}

          {displayValue ??
            (hasValue
              ? value
              : "Non renseigné")}
        </p>
      </div>
    );
  }

  /* =========================================================
     MODE ÉDITION
  ========================================================= */

  return (
    <div
      className={`space-y-1 ${className}`}
      ref={containerRef}
    >
      <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 flex items-center gap-1">
        <Phone
          size={14}
          className="text-[#008080]"
        />

        {label}

        {!required && (
          <span className="text-xs text-gray-400 ml-1">
            (optionnel)
          </span>
        )}
      </label>

      <div className="relative">
        {/* =================================================
            SELECTEUR PAYS
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            setShowCountries(
              (previous) => !previous
            )
          }
          className="absolute left-0 top-0 h-full px-3 flex items-center gap-2 border-r-2 border-[#B8E0E0] dark:border-zinc-700 bg-[#F7FFFF] dark:bg-zinc-800 rounded-l-xl hover:bg-[#E8F8F7] dark:hover:bg-zinc-700 transition z-20"
        >
          <img
            src={currentCountry.flagUrl}
            alt={currentCountry.name}
            className="w-6 h-[18px] object-cover rounded-[3px] shadow-sm"
            onError={(e) => {
              (
                e.target as HTMLImageElement
              ).style.visibility = "hidden";
            }}
          />

          <span className="text-sm font-medium text-[#0B3C3C] dark:text-zinc-200">
            {currentCountry.dialCode}
          </span>

          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${
              showCountries
                ? "rotate-180"
                : ""
            }`}
          />
        </button>

        {/* =================================================
            INPUT
        ================================================== */}

        <input
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          placeholder={
            placeholder ??
            `${currentCountry.dialCode} ...`
          }
          className="w-full pl-[122px] pr-4 py-3 border-2 border-[#B8E0E0] dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all"
        />

        {/* =================================================
            LISTE PAYS
        ================================================== */}

        {showCountries && (
          <div className="absolute z-[100] left-0 right-0 top-[calc(100%+8px)] bg-white dark:bg-zinc-900 border border-[#E5F5F5] dark:border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-[#E5F5F5] dark:border-zinc-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  autoFocus
                  type="text"
                  value={countrySearch}
                  onChange={(e) =>
                    setCountrySearch(
                      e.target.value
                    )
                  }
                  placeholder="Rechercher un pays..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border-2 border-[#B8E0E0] dark:border-zinc-700 focus:outline-none focus:border-[#008080] text-[#0B3C3C] dark:text-zinc-100 bg-white dark:bg-zinc-900"
                />
              </div>
            </div>

            <div className="max-h-[280px] overflow-y-auto">
              {filteredCountries.length ===
              0 ? (
                <div className="p-5 text-center text-sm text-gray-500 dark:text-zinc-400">
                  Aucun pays trouvé
                </div>
              ) : (
                filteredCountries.map(
                  (country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() =>
                        handleCountryChange(
                          country
                        )
                      }
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F0FDFC] dark:hover:bg-zinc-800 transition text-left ${
                        selectedCountry ===
                        country.code
                          ? "bg-[#E8F8F7] dark:bg-zinc-800"
                          : ""
                      }`}
                    >
                      <img
                        src={
                          country.flagUrl
                        }
                        alt=""
                        className="w-7 h-5 object-cover rounded-[3px] shadow-sm shrink-0"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).style.visibility =
                            "hidden";
                        }}
                      />

                      <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {country.name}
                      </span>

                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {country.dialCode}
                      </span>

                      {selectedCountry ===
                        country.code && (
                        <Check className="w-4 h-4 text-[#008080] shrink-0" />
                      )}
                    </button>
                  )
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          VALIDATION
      ================================================== */}

      {showValidationHint &&
        value?.trim() && (
          <div className="mt-1 flex items-center gap-2">
            {isValid ? (
              <>
                <Check className="w-3 h-3 text-green-600" />

                <span className="text-xs text-green-600">
                  Numéro valide
                </span>
              </>
            ) : (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-orange-400" />

                <span className="text-xs text-orange-500">
                  Numéro incomplet ou invalide
                </span>
              </>
            )}
          </div>
        )}
    </div>
  );
}