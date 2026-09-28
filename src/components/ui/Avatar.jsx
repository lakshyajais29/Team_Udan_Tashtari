const initials = (n) =>
  n
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Avatar component — falls back to monogram if no image is provided. */
export default function Avatar({ name, image, size = 'w-14 h-14 text-lg' }) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${size} shrink-0 rounded-xl object-cover`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`${size} shrink-0 rounded-xl grid place-items-center font-bold text-[#021018]`}
      style={{ background: 'linear-gradient(135deg,#22d3ee,#f5a524)' }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
