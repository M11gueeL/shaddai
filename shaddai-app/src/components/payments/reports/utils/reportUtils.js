export const combineAndSortTimeline = (report) => {
    if (!report) return [];
    
    const timeline = [];
    
    // Add Payments
    report.details.all_movements.forEach(p => {
        timeline.push({
            type: 'payment',
            id: p.id,
            date: p.payment_date,
            method: p.payment_method,
            mainText: p.patient_name || 'Paciente Desconocido',
            subText: `Ref: ${p.reference_number || 'N/A'} ${p.notes ? '- ' + p.notes : ''}`,
            user: p.registered_by_name || 'Sistema',
            amountDisplay: `${p.currency} ${Number(p.amount).toLocaleString()}`,
            status: p.status,
            rawDate: new Date(p.payment_date)
        });
    });

    // Add Receipts
    report.details.receipts.forEach(r => {
        timeline.push({
            type: 'receipt',
            id: r.id,
            date: r.issued_at,
            method: null,
            mainText: `Recibo #${r.receipt_number}`,
            subText: r.patient_name,
            user: r.issued_by_name,
            amountDisplay: '-',
            status: r.status,
            rawDate: new Date(r.issued_at)
        });
    });

    // Add Accounts
    report.details.new_accounts.forEach(a => {
        timeline.push({
            type: 'account',
            id: a.id,
            date: a.created_at,
            method: null,
            mainText: `Apertura Cuenta #${a.id}`,
            subText: a.patient_name,
            user: a.created_by_name,
            amountDisplay: '-',
            status: a.status,
            rawDate: new Date(a.created_at)
        });
    });

    return timeline.sort((a, b) => b.rawDate - a.rawDate);
};
