interface IconProps {
  className?: string;
}

export function XIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      className={className}
    >
      <g
        fill="none"
        fillRule="evenodd"
        stroke="none"
        strokeWidth="1"
        transform="translate(112 112)"
      >
        <path
          fill="#000"
          d="M711.111 800H88.89C39.8 800 0 760.2 0 711.111V88.89C0 39.8 39.8 0 88.889 0H711.11C760.2 0 800 39.8 800 88.889V711.11C800 760.2 760.2 800 711.111 800"
        />
        <path
          fill="#FFF"
          fillRule="nonzero"
          d="M628 623H484.942L174 179h143.058zm-126.012-37.651h56.96L300.013 216.65h-56.96z"
        />
        <path
          fill="#FFF"
          fillRule="nonzero"
          d="M219.296885 623 379 437.732409 358.114212 410 174 623z"
        />
        <path
          fill="#FFF"
          fillRule="nonzero"
          d="M409 348.387347 429.212986 377 603 177 558.330417 177z"
        />
      </g>
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="10" cy="10" r="8.75" fill="url(#fb-grad)" />
      <path
        d="M13.2586 12.676L13.6472 10.2063H11.2158V8.60437C11.2158 7.92856 11.5548 7.26942 12.6438 7.26942H13.75V5.16687C13.75 5.16687 12.7466 5 11.7877 5C9.78427 5 8.47604 6.18309 8.47604 8.32403V10.2063H6.25V12.676H8.47604V18.6465C8.92294 18.715 9.38015 18.75 9.8459 18.75C10.3117 18.75 10.7689 18.715 11.2158 18.6465V12.676H13.2586Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="fb-grad"
          x1="10"
          y1="1.25"
          x2="10"
          y2="18.6981"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#18ACFE" />
          <stop offset="1" stopColor="#0163E0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="1.25" y="1.25" width="17.5" height="17.5" rx="6" fill="url(#ig-grad-1)" />
      <rect x="1.25" y="1.25" width="17.5" height="17.5" rx="6" fill="url(#ig-grad-2)" />
      <rect x="1.25" y="1.25" width="17.5" height="17.5" rx="6" fill="url(#ig-grad-3)" />
      <path
        d="M14.375 6.5625C14.375 7.08027 13.9553 7.5 13.4375 7.5C12.9197 7.5 12.5 7.08027 12.5 6.5625C12.5 6.04473 12.9197 5.625 13.4375 5.625C13.9553 5.625 14.375 6.04473 14.375 6.5625Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 13.125C11.7259 13.125 13.125 11.7259 13.125 10C13.125 8.27411 11.7259 6.875 10 6.875C8.27411 6.875 6.875 8.27411 6.875 10C6.875 11.7259 8.27411 13.125 10 13.125ZM10 11.875C11.0355 11.875 11.875 11.0355 11.875 10C11.875 8.96447 11.0355 8.125 10 8.125C8.96447 8.125 8.125 8.96447 8.125 10C8.125 11.0355 8.96447 11.875 10 11.875Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.75 9.75C3.75 7.6498 3.75 6.5997 4.15873 5.79754C4.51825 5.09193 5.09193 4.51825 5.79754 4.15873C6.5997 3.75 7.6498 3.75 9.75 3.75H10.25C12.3502 3.75 13.4003 3.75 14.2025 4.15873C14.9081 4.51825 15.4817 5.09193 15.8413 5.79754C16.25 6.5997 16.25 7.6498 16.25 9.75V10.25C16.25 12.3502 16.25 13.4003 15.8413 14.2025C15.4817 14.9081 14.9081 15.4817 14.2025 15.8413C13.4003 16.25 12.3502 16.25 10.25 16.25H9.75C7.6498 16.25 6.5997 16.25 5.79754 15.8413C5.09193 15.4817 4.51825 14.9081 4.15873 14.2025C3.75 13.4003 3.75 12.3502 3.75 10.25V9.75ZM9.75 5H10.25C11.3207 5 12.0486 5.00097 12.6112 5.04694C13.1592 5.09171 13.4395 5.17287 13.635 5.27248C14.1054 5.51217 14.4878 5.89462 14.7275 6.36502C14.8271 6.56052 14.9083 6.84078 14.9531 7.3888C14.999 7.95141 15 8.67928 15 9.75V10.25C15 11.3207 14.999 12.0486 14.9531 12.6112C14.9083 13.1592 14.8271 13.4395 14.7275 13.635C14.4878 14.1054 14.1054 14.4878 13.635 14.7275C13.4395 14.8271 13.1592 14.9083 12.6112 14.9531C12.0486 14.999 11.3207 15 10.25 15H9.75C8.67928 15 7.95141 14.999 7.3888 14.9531C6.84078 14.9083 6.56052 14.8271 6.36502 14.7275C5.89462 14.4878 5.51217 14.1054 5.27248 13.635C5.17287 13.4395 5.09171 13.1592 5.04694 12.6112C5.00097 12.0486 5 11.3207 5 10.25V9.75C5 8.67928 5.00097 7.95141 5.04694 7.3888C5.09171 6.84078 5.17287 6.56052 5.27248 6.36502C5.51217 5.89462 5.89462 5.51217 6.36502 5.27248C6.56052 5.17287 6.84078 5.09171 7.3888 5.04694C7.95141 5.00097 8.67928 5 9.75 5Z"
        fill="white"
      />
      <defs>
        <radialGradient
          id="ig-grad-1"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(7.5 14.375) rotate(-55.3758) scale(15.9498)"
        >
          <stop stopColor="#B13589" />
          <stop offset="0.79309" stopColor="#C62F94" />
          <stop offset="1" stopColor="#8A3AC8" />
        </radialGradient>
        <radialGradient
          id="ig-grad-2"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(6.875 19.375) rotate(-65.1363) scale(14.1214)"
        >
          <stop stopColor="#E0E8B7" />
          <stop offset="0.444662" stopColor="#FB8A2E" />
          <stop offset="0.71474" stopColor="#E2425C" />
          <stop offset="1" stopColor="#E2425C" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="ig-grad-3"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(0.312501 1.875) rotate(-8.1301) scale(24.3068 5.19897)"
        >
          <stop offset="0.156701" stopColor="#406ADC" />
          <stop offset="0.467799" stopColor="#6A45BE" />
          <stop offset="1" stopColor="#6A45BE" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1.40282 6.21319C1.48315 4.97646 2.47747 4.00723 3.71529 3.9459C5.50774 3.8571 8.06967 3.75 10 3.75C11.9303 3.75 14.4923 3.8571 16.2847 3.9459C17.5225 4.00723 18.5169 4.97646 18.5972 6.21319C18.6741 7.39808 18.75 8.85604 18.75 10C18.75 11.144 18.6741 12.6019 18.5972 13.7868C18.5169 15.0235 17.5225 15.9928 16.2847 16.0541C14.4923 16.1429 11.9303 16.25 10 16.25C8.06967 16.25 5.50774 16.1429 3.71529 16.0541C2.47747 15.9928 1.48315 15.0235 1.40282 13.7868C1.32585 12.6019 1.25 11.144 1.25 10C1.25 8.85604 1.32585 7.39808 1.40282 6.21319Z"
        fill="#FC0D1B"
      />
      <path d="M8.125 7.5V12.5L13.125 10L8.125 7.5Z" fill="white" />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="1.25" y="1.25" width="17.5" height="17.5" rx="8.75" fill="#1275B1" />
      <path
        d="M7.8866 6.05759C7.8866 6.64169 7.38032 7.11519 6.7558 7.11519C6.13128 7.11519 5.625 6.64169 5.625 6.05759C5.625 5.4735 6.13128 5 6.7558 5C7.38032 5 7.8866 5.4735 7.8866 6.05759Z"
        fill="white"
      />
      <path d="M5.77964 7.89256H7.71263V13.75H5.77964V7.89256Z" fill="white" />
      <path
        d="M10.8247 7.89256H8.89175V13.75H10.8247C10.8247 13.75 10.8247 11.906 10.8247 10.753C10.8247 10.061 11.061 9.36596 12.0039 9.36596C13.0694 9.36596 13.063 10.2716 13.058 10.9732C13.0515 11.8903 13.067 12.8262 13.067 13.75H15V10.6586C14.9836 8.68461 14.4693 7.77505 12.7771 7.77505C11.7721 7.77505 11.1492 8.23129 10.8247 8.64406V7.89256Z"
        fill="white"
      />
    </svg>
  );
}
