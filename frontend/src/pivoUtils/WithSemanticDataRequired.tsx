import React from 'react'

import usePivoData from './use-pivo-data'

const WithSemanticDataRequired = ({
    data,
    mappings,
    children,
    loader
}: {
    data: any;
    mappings: any;
    children: (dataToDisplay: any) => React.ReactNode;
    loader?: React.ReactNode;
}) => {
    const dataToDisplay = usePivoData(data, mappings);
    if (data === undefined) {
        return <>{loader || null}</>;
    } else {
        return <>{children(dataToDisplay)}</>;
    }
};

export default WithSemanticDataRequired