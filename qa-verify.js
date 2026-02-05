// Native fetch used

async function checkPersistence() {
    const baseURL = 'http://localhost:4000';
    console.log("Checking persistence...");

    try {
        const listRes = await fetch(`${baseURL}/bm/list`);
        const listData = await listRes.json();

        // Ensure listData.bms exists and is array
        const bms = listData.bms || [];
        const found = bms.find(b => b.bmId === 'bm-persistent-01');

        if (found) {
            console.log("PASS: Persistence Verified. Found 'TestBM'.");
        } else {
            console.log("FAIL: Persistence Failed. 'TestBM' not found.");
            console.log("Current BMs:", bms);
        }
    } catch (e) {
        console.error("Error checking persistence:", e.message);
    }
}

checkPersistence();
