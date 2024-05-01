import React from 'react'

import usePivoData from './use-pivo-data'

const WithSemanticDataRequired = ({
    data,
    mappings,
    children,
    loader
}) => {
    const dataToDisplay = usePivoData(data, mappings);
    if (data === undefined) {
        return <>{loader || null}</>;
    } else {
        return <>{children(dataToDisplay)}</>;
    }
};

export default WithSemanticDataRequired