import { useState } from "react";
import ModalDocuments from "../../Modal/ModalDocuments";

const AddItemButton = ({ apiOnHand }) => {
    const [showModalItem, setShowModalItem] = useState(false);

    const handleShowModalItem = () => setShowModalItem(true);
    const handleCloseModalItem = () => setShowModalItem(false);

    return (
        <>
            <button
                className="btn text-white w-60"
                onClick={handleShowModalItem}
                style={{ backgroundColor: 'green', fontSize: '14px' }}
            >
                <i className="fa fa-plus me-2" aria-hidden="true"></i> เพิ่มรายการ
            </button>
            <ModalDocuments
                showModalItem={showModalItem}
                handleCloseModalItem={handleCloseModalItem}
                apiOnHand={apiOnHand}
            />
        </>
    );
};

export default AddItemButton;
