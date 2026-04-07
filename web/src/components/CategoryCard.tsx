interface CategoryCardProps {
  title: string;
  content: string;
}

const CategoryCard = ({ title, content }: CategoryCardProps) => {
  return (
    <div className="bg-secondary border-2 border-primary rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <h3 className="text-xl font-heading font-bold text-primary mb-3 border-b-2 border-accent pb-2">
        {title}
      </h3>
      <p className="text-gray-800 leading-relaxed whitespace-pre-line">
        {content}
      </p>
    </div>
  );
};

export default CategoryCard;
