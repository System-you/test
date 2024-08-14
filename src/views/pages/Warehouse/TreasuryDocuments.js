import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Main from '../../components/Warehouse/TreasuryDocuments/Main';
import FormTransfer from '../../components/Warehouse/TreasuryDocuments/FormTransfer';
import FormDown from '../../components/Warehouse/TreasuryDocuments/FormDown';

const TreasuryDocuments = () => {
  const [mode, setMode] = useState('S');

  const onChangeMode = (mode) => {
    return () => setMode(mode); // Return a function to be used as onClick handler
  };

  useEffect(() => {
    setMode('S');
    // console.debug('Current mode =>', mode);

  }, []);

  return (
    <div>
      <div className="TreasuryDocuments">
        <div className="wrapper">
          <Sidebar />
          <div className="main-panel">
            <div className="container">
              <div className="page-inner">
                {mode === 'S' && (
                  <Main
                    name={'จัดการเอกสารงานคลัง'}
                    onChangeMode={onChangeMode}
                  />
                )}
                {mode === 'FD' && (
                  <FormDown
                    name={'จัดการเอกสารงานคลัง'}
                  />
                )}
                {mode === 'TF' && (
                  <FormTransfer
                    name={'จัดการเอกสารงานคลัง'}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreasuryDocuments;
