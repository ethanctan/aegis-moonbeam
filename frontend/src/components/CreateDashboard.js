import React, { useState } from 'react';
import { utils } from 'ethers';

const CreateDashboard = ({ consumerDashboardGen, signer }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateDashboard = async () => {
    try {
      setIsLoading(true);

      // Prepare your transaction with gas
      const tx = await consumerDashboardGen.connect(signer).createDashboard({
        gasLimit: utils.hexlify(250000),
      });

      // Wait for the transaction to be confirmed
      await tx.wait();

      setIsLoading(false);
      console.log('Dashboard created successfully!');
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating dashboard:', error);
    }
  };

  return (
    <div className="flex justify-center items-center mt-4">
      <button
        className="bg-blue-500 text-white rounded px-4 py-2 h-12"
        disabled={isLoading}
        onClick={handleCreateDashboard}
      >
        {isLoading ? (
          <span className="flex items-center">
            <div className="w-4 h-4 border-2 border-white rounded-full animate-spin mr-2"></div>
            <span>Loading...</span>
          </span>
        ) : (
          'Create Dashboard'
        )}
      </button>
    </div>
  );
};

export default CreateDashboard;
