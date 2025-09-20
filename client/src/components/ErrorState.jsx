const ErrorState = ({ message = 'Something went wrong. Please try again.' }) => {
  return (
    <div className="rounded-2xl border border-primary bg-accent px-6 py-8 text-center">
      <p className="text-sm font-medium text-primary">{message}</p>
    </div>
  );
};

export default ErrorState;
