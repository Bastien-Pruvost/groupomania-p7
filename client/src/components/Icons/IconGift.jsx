// import styles from './Icon.module.css';

const IconGift = ({ size, color }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      stroke={color ? color : 'currentColor'}
      fill='none'
      width={size}
      height={size}
    >
      <polyline points='20 12 20 22 4 22 4 12' />
      <rect x={2} y={7} width={20} height={5} />
      <line x1={12} y1={22} x2={12} y2={7} />
      <path d='M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z' />
      <path d='M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z' />
    </svg>
  );
};

export default IconGift;
