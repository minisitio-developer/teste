import React from "react";

const AlertMsg = ({message, setAlert}) => {
    return (
        <div className="msg">
            <div className="alert alert-success alert-dismissible fade show alertShow" style={{ "width": "676px" }}>
                <button type="button" className="btn-close" onClick={() => {setAlert(false)}}></button>
                <strong>Sucesso!</strong> {message}
            </div>
        </div>
    )
};

export default AlertMsg;

//<button type="button" className="btn-close" data-bs-dismiss="alert"></button>