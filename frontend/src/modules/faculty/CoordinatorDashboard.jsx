import React from 'react';
import RoleApprovalDashboard from '../../components/RoleApprovalDashboard';

const CoordinatorDashboard = () => {
    return (
        <RoleApprovalDashboard 
            role="coordinator" 
            title="COORDINATOR OVERSIGHT" 
            subtitle="Departmental Internship Approval & Coordination"
        />
    );
};

export default CoordinatorDashboard;
