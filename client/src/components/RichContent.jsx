const createMarkup = (html) => ({ __html: html });

const RichContent = ({ html }) => {
  if (!html) return null;
  return <div className="rich-text" dangerouslySetInnerHTML={createMarkup(html)} />;
};

export default RichContent;

