type Props = {
  index: string;
  /** The heading's id, for the section's aria-labelledby. */
  id: string;
  title: string;
  intro: string;
};

/** Every section opens the same way: its number, its name, one line on what is in it. */
export default function SectionHead({ index, id, title, intro }: Props) {
  return (
    <header className="section-head">
      <div>
        <span className="section-head__index" aria-hidden="true">
          {index}
        </span>
        <h2 className="section-head__title" id={id} data-reveal>
          {title}
        </h2>
      </div>
      <p className="section-head__intro" data-reveal>
        {intro}
      </p>
    </header>
  );
}
