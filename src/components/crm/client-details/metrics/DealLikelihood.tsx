interface DealLikelihoodProps {
  likelihood: number | null;
}

export const DealLikelihood = ({ likelihood }: DealLikelihoodProps) => {
  return (
    <div className="p-4 bg-primary/5 rounded-lg transition-all duration-300 hover:bg-primary/10">
      <div className="flex justify-between items-center">
        <p className="text-sm text-primary font-medium">Deal Likelihood</p>
        <span className={`px-2 py-1 rounded-full text-sm ${
          likelihood && likelihood > 70 ? 'bg-green-100 text-green-800' :
          likelihood && likelihood > 30 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {likelihood ? `${likelihood}%` : 'N/A'}
        </span>
      </div>
    </div>
  );
};